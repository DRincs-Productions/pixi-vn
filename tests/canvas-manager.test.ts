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

        let resolveImage!: (value: { src: string }) => void;
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

        resolveImage({ src: "data:image/png;base64,abc" });
        await expect(extractedImagePromise).resolves.toBe("data:image/png;base64,abc");
        expect(gameLayer.renderable).toBe(false);
    });
});
