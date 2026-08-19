import { afterEach, describe, expect, test, vi } from "vitest";
import CanvasManager from "../src/canvas/CanvasManager";
import CanvasManagerStatic from "../src/canvas/CanvasManagerStatic";

function createTicker(paused = false) {
    let pausedValue = paused;
    return {
        alias: "test",
        id: crypto.randomUUID(),
        args: {},
        canvasElementAliases: [],
        complete: vi.fn(),
        stop: vi.fn(),
        start: vi.fn(),
        pause: vi.fn(() => {
            pausedValue = true;
        }),
        play: vi.fn(() => {
            pausedValue = false;
        }),
        get paused() {
            return pausedValue;
        },
    };
}

function createGameLayer(renderable = true) {
    return {
        renderable,
        label: "game-layer",
        children: [],
        getChildIndex: vi.fn(() => 0),
        width: 0,
        height: 0,
        isRenderGroup: false,
        blendMode: "normal",
        tint: 0xffffff,
        alpha: 1,
        angle: 0,
        rotation: 0,
        scale: { x: 1, y: 1 },
        pivot: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        skew: { x: 0, y: 0 },
        visible: true,
        x: 0,
        y: 0,
        boundsArea: undefined,
        cursor: "default",
        eventMode: "auto",
        interactive: false,
        interactiveChildren: true,
        hitArea: undefined,
        onEventsHandlers: {},
        parent: undefined,
    };
}

describe("CanvasManager gameLayer render controls", () => {
    afterEach(() => {
        CanvasManagerStatic._currentTickers.clear();
        vi.restoreAllMocks();
    });

    test("pause/resume pause and resume only active tickers", () => {
        const manager = new CanvasManager();
        const gameLayer = { renderable: true };
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer as any);

        const activeTicker = createTicker(false);
        const alreadyPausedTicker = createTicker(true);
        CanvasManagerStatic._currentTickers.set("active", { ticker: activeTicker } as any);
        CanvasManagerStatic._currentTickers.set("paused", { ticker: alreadyPausedTicker } as any);

        manager.pause();
        expect(gameLayer.renderable).toBe(false);
        expect(activeTicker.pause).toHaveBeenCalledTimes(1);
        expect(alreadyPausedTicker.pause).not.toHaveBeenCalled();

        manager.resume();
        expect(gameLayer.renderable).toBe(true);
        expect(activeTicker.play).toHaveBeenCalledTimes(1);
        expect(alreadyPausedTicker.play).not.toHaveBeenCalled();
    });

    test("export temporarily resumes and then re-pauses when game layer is paused", () => {
        const manager = new CanvasManager();
        const gameLayer = createGameLayer(false);
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer as any);

        const resumeSpy = vi.spyOn(manager, "resume");
        const pauseSpy = vi.spyOn(manager, "pause");

        manager.export();

        expect(resumeSpy).toHaveBeenCalledTimes(1);
        expect(pauseSpy).toHaveBeenCalledTimes(1);
        expect(gameLayer.renderable).toBe(false);
    });

    test("extractImage resumes only for extraction and pauses again immediately", async () => {
        const manager = new CanvasManager();
        const gameLayer = createGameLayer(false);
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer as any);

        let resolveImage: ((value: { src: string }) => void) | undefined;
        const imagePromise = new Promise<{ src: string }>((resolve) => {
            resolveImage = resolve;
        });

        vi.spyOn(manager, "app", "get").mockReturnValue({
            stage: {},
            renderer: {
                extract: {
                    image: vi.fn(() => {
                        expect(gameLayer.renderable).toBe(true);
                        return imagePromise as Promise<HTMLImageElement>;
                    }),
                },
            },
        } as any);

        const extractedImagePromise = manager.extractImage();
        expect(gameLayer.renderable).toBe(false);

        resolveImage?.({ src: "data:image/png;base64,abc" });
        await expect(extractedImagePromise).resolves.toBe("data:image/png;base64,abc");
        expect(gameLayer.renderable).toBe(false);
    });
});

describe("CanvasManager.tickers namespace", () => {
    afterEach(() => {
        CanvasManagerStatic._currentTickers.clear();
        CanvasManagerStatic._currentTickersSequence.clear();
        vi.restoreAllMocks();
    });

    test("tickers.currentTickers exposes the same map as CanvasManagerStatic._currentTickers", () => {
        const manager = new CanvasManager();
        expect(manager.tickers.currentTickers).toBe(CanvasManagerStatic._currentTickers);
    });

    test("tickers.currentTickersSteps exposes the same map as CanvasManagerStatic._currentTickersSequence", () => {
        const manager = new CanvasManager();
        expect(manager.tickers.currentTickersSteps).toBe(CanvasManagerStatic._currentTickersSequence);
    });

    test("tickers.find returns the ticker registered under the given id", () => {
        const manager = new CanvasManager();
        const ticker = createTicker();
        CanvasManagerStatic._currentTickers.set("t1", { ticker } as any);
        expect(manager.tickers.find("t1")).toBe(ticker);
        expect(manager.tickers.find("missing")).toBeUndefined();
    });

    test("tickers.remove stops and removes the ticker", () => {
        const manager = new CanvasManager();
        const ticker = createTicker();
        CanvasManagerStatic._currentTickers.set("t1", { ticker } as any);
        manager.tickers.remove("t1");
        expect(ticker.stop).toHaveBeenCalledOnce();
        expect(CanvasManagerStatic._currentTickers.has("t1")).toBe(false);
    });

    test("tickers.removeAll clears every running ticker", () => {
        const manager = new CanvasManager();
        CanvasManagerStatic._currentTickers.set("t1", { ticker: createTicker() } as any);
        CanvasManagerStatic._currentTickers.set("t2", { ticker: createTicker() } as any);
        manager.tickers.removeAll();
        expect(CanvasManagerStatic._currentTickers.size).toBe(0);
    });

    test("tickers.pause and tickers.resume by canvas alias", () => {
        const manager = new CanvasManager();
        const ticker = createTicker(false);
        (ticker as any).canvasElementAliases = ["alien"];
        (ticker as any).alias = "RotateTicker";
        CanvasManagerStatic._currentTickers.set("t1", { ticker } as any);

        const pausedIds = manager.tickers.pause({ canvasAlias: "alien" });
        expect(pausedIds).toEqual(["t1"]);
        expect(ticker.pause).toHaveBeenCalledOnce();

        manager.tickers.resume({ canvasAlias: "alien" });
        expect(ticker.play).toHaveBeenCalledOnce();
    });

    test("tickers.isPaused always returns false (stub kept for backward compatibility)", () => {
        const manager = new CanvasManager();
        expect(manager.tickers.isPaused("alien")).toBe(false);
    });

    test("tickers.transfer removes the old alias from a ticker's canvasElementAliases in 'move' mode", () => {
        const manager = new CanvasManager();
        const ticker = createTicker(false);
        (ticker as any).canvasElementAliases = ["old"];
        (ticker as any).alias = "RotateTicker";
        (ticker as any).args = {};
        CanvasManagerStatic._currentTickers.set("t1", { ticker } as any);

        manager.tickers.transfer("old", "new", "move");

        expect(ticker.canvasElementAliases).toEqual([]);
    });

    test("deprecated flat methods delegate to the tickers namespace", () => {
        const manager = new CanvasManager();
        const ticker = createTicker();
        CanvasManagerStatic._currentTickers.set("t1", { ticker } as any);

        expect(manager.findTicker("t1")).toBe(ticker);
        expect(manager.currentTickers).toBe(manager.tickers.currentTickers);
        expect(manager.currentTickersSteps).toBe(manager.tickers.currentTickersSteps);

        manager.removeTicker("t1");
        expect(ticker.stop).toHaveBeenCalledOnce();
        expect(CanvasManagerStatic._currentTickers.has("t1")).toBe(false);
    });
});
