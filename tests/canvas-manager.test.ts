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

describe("CanvasManager gameLayer render controls", () => {
    afterEach(() => {
        CanvasManagerStatic._currentTickers.clear();
        vi.restoreAllMocks();
    });

    test("pauseGameLayerRender/resumeGameLayerRender pause and resume only active tickers", () => {
        const manager = new CanvasManager();
        const gameLayer = { renderable: true };
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer as any);

        const activeTicker = createTicker(false);
        const alreadyPausedTicker = createTicker(true);
        CanvasManagerStatic._currentTickers.set("active", { ticker: activeTicker } as any);
        CanvasManagerStatic._currentTickers.set("paused", { ticker: alreadyPausedTicker } as any);

        manager.pauseGameLayerRender();
        expect(gameLayer.renderable).toBe(false);
        expect(activeTicker.pause).toHaveBeenCalledTimes(1);
        expect(alreadyPausedTicker.pause).not.toHaveBeenCalled();

        manager.resumeGameLayerRender();
        expect(gameLayer.renderable).toBe(true);
        expect(activeTicker.play).toHaveBeenCalledTimes(1);
        expect(alreadyPausedTicker.play).not.toHaveBeenCalled();
    });
});
