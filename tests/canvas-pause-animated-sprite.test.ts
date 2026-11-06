import type {
    Container,
    AnimatedSprite as PixiAnimatedSprite,
    Texture,
    Ticker,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AnimatedSprite, VideoSprite } from "../src/canvas";
import CanvasManager from "../src/canvas/CanvasManager";
import CanvasManagerStatic from "../src/canvas/CanvasManagerStatic";
import type { AnimatedSpriteMemory, VideoSpriteMemory } from "../src/canvas";
import { TickersManagerStatic } from "../src/tickers";
import { logger } from "../src/utils/log-utility";

function createTextures(count = 4): Texture[] {
    return Array.from(
        { length: count },
        () => new PIXI.Texture({ source: new PIXI.TextureSource({ width: 8, height: 8 }) }),
    );
}

function createPlayingSprite(autoUpdate = false) {
    const sprite = new PIXI.AnimatedSprite({ textures: createTextures(), autoUpdate });
    sprite.play();
    return sprite;
}

/** A pixi-vn AnimatedSprite advancing one frame per {@link step} (manual update, looping). */
function createCoreSprite(playing = true) {
    const sprite = new AnimatedSprite({ autoUpdate: false, animationSpeed: 1, loop: true });
    sprite.textures = createTextures();
    if (playing) {
        sprite.play();
    }
    return sprite;
}

function step(sprite: PixiAnimatedSprite) {
    sprite.update({ deltaTime: 1 } as Ticker);
}

describe("CanvasManager pause/resume of plain PixiJS AnimatedSprites", () => {
    let manager: CanvasManager;
    let gameLayer: Container;

    beforeEach(() => {
        manager = new CanvasManager();
        gameLayer = new PIXI.Container();
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer);
    });

    afterEach(() => {
        TickersManagerStatic._currentTickers.clear();
        vi.restoreAllMocks();
    });

    test("stops playing sprites, including nested ones, and restarts only those", () => {
        const playing = createPlayingSprite();
        const alreadyStopped = new PIXI.AnimatedSprite({ textures: createTextures(), autoUpdate: false });
        const nested = createPlayingSprite();
        const group = new PIXI.Container();
        const innerGroup = new PIXI.Container();
        innerGroup.addChild(nested);
        group.addChild(innerGroup);
        gameLayer.addChild(playing, alreadyStopped, group);

        manager.pause();
        expect(playing.playing).toBe(false);
        expect(nested.playing).toBe(false);
        expect(alreadyStopped.playing).toBe(false);

        manager.resume();
        expect(playing.playing).toBe(true);
        expect(nested.playing).toBe(true);
        expect(alreadyStopped.playing).toBe(false);
    });

    test("pause and resume are idempotent", () => {
        const sprite = createPlayingSprite();
        gameLayer.addChild(sprite);
        const stopSpy = vi.spyOn(sprite, "stop");
        const playSpy = vi.spyOn(sprite, "play");

        manager.pause();
        manager.pause();
        expect(stopSpy).toHaveBeenCalledTimes(1);

        manager.resume();
        manager.resume();
        expect(playSpy).toHaveBeenCalledTimes(1);
        expect(sprite.playing).toBe(true);
    });

    test("does not touch sprites outside the game layer", () => {
        const otherLayer = new PIXI.Container();
        const uiSprite = createPlayingSprite();
        otherLayer.addChild(uiSprite);

        manager.pause();
        expect(uiSprite.playing).toBe(true);
    });

    test("does not restart sprites removed or destroyed while paused", () => {
        const removed = createPlayingSprite();
        const destroyed = createPlayingSprite();
        const nestedRemoved = createPlayingSprite();
        const group = new PIXI.Container();
        group.addChild(nestedRemoved);
        gameLayer.addChild(removed, destroyed, group);

        manager.pause();
        gameLayer.removeChild(removed);
        destroyed.destroy();
        gameLayer.removeChild(group);
        const playSpies = [removed, destroyed, nestedRemoved].map((s) => vi.spyOn(s, "play"));

        manager.resume();
        playSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
        expect(removed.playing).toBe(false);
        expect(nestedRemoved.playing).toBe(false);
    });

    test("does not stop or track sprites started while paused", () => {
        manager.pause();
        const startedWhilePaused = createPlayingSprite();
        gameLayer.addChild(startedWhilePaused);
        expect(startedWhilePaused.playing).toBe(true);

        manager.resume();
        expect(startedWhilePaused.playing).toBe(true);
    });

    test("clear discards stale references", () => {
        const sprite = createPlayingSprite();
        gameLayer.addChild(sprite);
        manager.pause();

        manager.clear();
        expect(gameLayer.children).toHaveLength(0);
        // Re-adding the same instance must not make it restart from the stale tracking.
        gameLayer.addChild(sprite);
        const playSpy = vi.spyOn(sprite, "play");
        manager.resume();
        expect(playSpy).not.toHaveBeenCalled();
        expect(sprite.playing).toBe(false);
    });

    test("freezes frames on the shared ticker without stopping it", () => {
        const ticker = PIXI.Ticker.shared;
        // Shared ticker state before this test touched it, restored in `finally` so we don't leak a
        // started ticker (and its RAF loop) into other tests.
        const originallyStarted = ticker.started;
        let sprite: ReturnType<typeof createPlayingSprite> | undefined;

        try {
            // An autoUpdate sprite adds a listener to the shared ticker, which may start it (autoStart).
            sprite = createPlayingSprite(true);
            sprite.animationSpeed = 1;
            gameLayer.addChild(sprite);
            const frameTime = 1000 / 60;
            // Baseline taken after setup: what we assert is that pause() itself doesn't change it.
            const startedBeforePause = ticker.started;

            manager.pause();
            expect(ticker.started).toBe(startedBeforePause);
            const frameWhilePaused = sprite.currentFrame;
            ticker.update(ticker.lastTime + frameTime);
            expect(sprite.currentFrame).toBe(frameWhilePaused);

            manager.resume();
            // Leave a small timing margin: `currentFrame` advances only after the ticker's deltaTime
            // reaches a whole frame, and floating-point rounding can put one nominal frame just below it.
            ticker.update(ticker.lastTime + frameTime * 2);
            expect(sprite.currentFrame).not.toBe(frameWhilePaused);
        } finally {
            sprite?.destroy();
            if (originallyStarted && !ticker.started) {
                ticker.start();
            } else if (!originallyStarted && ticker.started) {
                ticker.stop();
            }
        }
    });
});

describe("CanvasManager pause/resume of pixi-vn AnimatedSprites", () => {
    let manager: CanvasManager;
    let gameLayer: Container;

    beforeEach(() => {
        manager = new CanvasManager();
        gameLayer = new PIXI.Container();
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer);
    });

    afterEach(() => {
        TickersManagerStatic._currentTickers.clear();
        vi.restoreAllMocks();
    });

    test("freezes frames while keeping the requested playing state, then continues", () => {
        const sprite = createCoreSprite();
        const nested = createCoreSprite();
        const group = new PIXI.Container();
        group.addChild(nested);
        gameLayer.addChild(sprite, group);
        const stopSpy = vi.spyOn(sprite, "stop");

        manager.pause();
        expect(sprite.playing).toBe(true);
        expect(stopSpy).not.toHaveBeenCalled();
        step(sprite);
        step(nested);
        expect(sprite.currentFrame).toBe(0);
        expect(nested.currentFrame).toBe(0);

        manager.resume();
        step(sprite);
        step(nested);
        expect(sprite.currentFrame).toBe(1);
        expect(nested.currentFrame).toBe(1);
    });

    test("an explicit stop() while paused stays stopped after resume", () => {
        const sprite = createCoreSprite();
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.stop();
        expect(sprite.playing).toBe(false);

        manager.resume();
        expect(sprite.playing).toBe(false);
        step(sprite);
        expect(sprite.currentFrame).toBe(0);
    });

    test("an explicit gotoAndStop() while paused stays stopped on that frame after resume", () => {
        const sprite = createCoreSprite();
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.gotoAndStop(2);

        manager.resume();
        expect(sprite.playing).toBe(false);
        step(sprite);
        expect(sprite.currentFrame).toBe(2);
    });

    test("a sprite already stopped before pause stays stopped", () => {
        const sprite = createCoreSprite(false);
        gameLayer.addChild(sprite);

        manager.pause();
        manager.resume();
        expect(sprite.playing).toBe(false);
        step(sprite);
        expect(sprite.currentFrame).toBe(0);
    });

    test("an explicit play() while paused is kept and starts on resume", () => {
        const sprite = createCoreSprite(false);
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.play();
        expect(sprite.playing).toBe(true);
        step(sprite);
        expect(sprite.currentFrame).toBe(0);

        manager.resume();
        step(sprite);
        expect(sprite.currentFrame).toBe(1);
    });

    test("repeated pauses keep the latest requested state", () => {
        const sprite = createCoreSprite();
        gameLayer.addChild(sprite);

        manager.pause();
        manager.pause();
        sprite.stop();
        manager.resume();
        manager.resume();
        expect(sprite.playing).toBe(false);

        manager.pause();
        manager.resume();
        expect(sprite.playing).toBe(false);

        manager.pause();
        sprite.play();
        manager.resume();
        step(sprite);
        expect(sprite.playing).toBe(true);
        expect(sprite.currentFrame).toBe(1);
    });

    test("export while paused saves the requested state and keeps the suspension", () => {
        const playing = createCoreSprite();
        const stopped = createCoreSprite();
        playing.label = "hero";
        stopped.label = "explosion";
        gameLayer.addChild(playing, stopped);
        manager.pause();
        stopped.stop();
        const playSpies = [vi.spyOn(playing, "play"), vi.spyOn(stopped, "play")];
        const resumeSpy = vi.spyOn(manager, "resume");

        const state = manager.export();
        expect((state.elements.hero as AnimatedSpriteMemory).playing).toBe(true);
        expect((state.elements.explosion as AnimatedSpriteMemory).playing).toBe(false);
        expect(state.stage.renderable).toBe(true);
        expect(gameLayer.renderable).toBe(false);
        expect(stopped.playing).toBe(false);
        playSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
        expect(resumeSpy).not.toHaveBeenCalled();
        step(playing);
        expect(playing.currentFrame).toBe(0);

        manager.resume();
        expect(stopped.playing).toBe(false);
        step(playing);
        expect(playing.currentFrame).toBe(1);
    });

    test("changing autoUpdate while paused doesn't unfreeze the sprite on the shared ticker", () => {
        const ticker = PIXI.Ticker.shared;
        const originallyStarted = ticker.started;
        const sprite = new AnimatedSprite({ animationSpeed: 1, loop: true });
        try {
            sprite.textures = createTextures();
            sprite.play();
            gameLayer.addChild(sprite);
            const frameTime = 1000 / 60;

            manager.pause();
            sprite.autoUpdate = false;
            sprite.autoUpdate = true;
            ticker.update(ticker.lastTime + frameTime);
            expect(sprite.currentFrame).toBe(0);

            manager.resume();
            ticker.update(ticker.lastTime + frameTime * 2);
            expect(sprite.currentFrame).not.toBe(0);
        } finally {
            sprite.destroy();
            if (originallyStarted && !ticker.started) {
                ticker.start();
            } else if (!originallyStarted && ticker.started) {
                ticker.stop();
            }
        }
    });

    test("sprites added while paused are not suspended", () => {
        manager.pause();
        const sprite = createCoreSprite();
        gameLayer.addChild(sprite);
        step(sprite);
        expect(sprite.currentFrame).toBe(1);
        manager.resume();
    });

    test("sprites removed while paused stay stopped after resume, destroyed ones are skipped", () => {
        const removed = createCoreSprite();
        const nestedRemoved = createCoreSprite();
        const group = new PIXI.Container();
        group.addChild(nestedRemoved);
        const destroyed = createCoreSprite();
        const kept = createCoreSprite();
        gameLayer.addChild(removed, group, destroyed, kept);

        manager.pause();
        gameLayer.removeChild(removed, group);
        destroyed.destroy();
        const destroyedStop = vi.spyOn(destroyed, "stop");

        expect(() => manager.resume()).not.toThrow();
        expect(destroyedStop).not.toHaveBeenCalled();
        for (const sprite of [removed, nestedRemoved]) {
            expect(sprite.systemPaused).toBe(false);
            expect(sprite.playing).toBe(false);
            step(sprite);
            expect(sprite.currentFrame).toBe(0);
        }
        expect(kept.playing).toBe(true);
        step(kept);
        expect(kept.currentFrame).toBe(1);
    });

    test("clear releases the suspension without restarting the removed sprites", () => {
        const sprite = createCoreSprite();
        gameLayer.addChild(sprite);
        manager.pause();

        manager.clear();
        expect(sprite.systemPaused).toBe(false);
        expect(sprite.playing).toBe(false);
        step(sprite);
        expect(sprite.currentFrame).toBe(0);
    });
});

/**
 * A texture backed by a real (jsdom) `HTMLVideoElement`; `paused`/`play`/`pause` are stubbed because
 * jsdom doesn't implement media playback.
 */
function createVideoTexture(options: { paused?: boolean; playError?: unknown } = {}) {
    const video = document.createElement("video");
    let paused = options.paused ?? false;
    Object.defineProperty(video, "paused", { get: () => paused });
    video.pause = vi.fn(() => {
        paused = true;
    });
    video.play = vi.fn(() => {
        paused = false;
        return options.playError ? Promise.reject(options.playError) : Promise.resolve();
    });
    const texture: Texture = new PIXI.Texture({
        source: new PIXI.TextureSource({ resource: video, width: 8, height: 8 }),
    });
    return { video, texture };
}

describe("CanvasManager pause/resume of videos", () => {
    let manager: CanvasManager;
    let gameLayer: Container;

    beforeEach(() => {
        manager = new CanvasManager();
        gameLayer = new PIXI.Container();
        vi.spyOn(CanvasManagerStatic, "gameLayer", "get").mockReturnValue(gameLayer);
    });

    afterEach(() => {
        TickersManagerStatic._currentTickers.clear();
        vi.restoreAllMocks();
    });

    test("pauses playing videos, including nested ones, and resumes only those", () => {
        const playing = createVideoTexture();
        const alreadyPaused = createVideoTexture({ paused: true });
        const nested = createVideoTexture();
        const sprite = new VideoSprite(playing.texture);
        const group = new PIXI.Container();
        group.addChild(new PIXI.Sprite(nested.texture));
        gameLayer.addChild(sprite, new VideoSprite(alreadyPaused.texture), group);

        manager.pause();
        expect(playing.video.paused).toBe(true);
        expect(nested.video.paused).toBe(true);
        expect(alreadyPaused.video.pause).not.toHaveBeenCalled();
        // The requested state, not the temporary suspension
        expect(sprite.paused).toBe(false);
        expect(sprite.memory.paused).toBe(false);

        manager.resume();
        expect(playing.video.play).toHaveBeenCalledTimes(1);
        expect(nested.video.play).toHaveBeenCalledTimes(1);
        expect(alreadyPaused.video.play).not.toHaveBeenCalled();
        expect(alreadyPaused.video.paused).toBe(true);
    });

    test("pause and resume are idempotent", () => {
        const { video, texture } = createVideoTexture();
        gameLayer.addChild(new VideoSprite(texture));

        manager.pause();
        manager.pause();
        expect(video.pause).toHaveBeenCalledTimes(1);

        manager.resume();
        manager.resume();
        expect(video.play).toHaveBeenCalledTimes(1);
    });

    test("an explicit VideoSprite.pause() while paused stays paused after resume", () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.pause();
        expect(sprite.paused).toBe(true);
        expect(sprite.memory.paused).toBe(true);

        manager.resume();
        expect(video.play).not.toHaveBeenCalled();
        expect(sprite.paused).toBe(true);
    });

    test("setting paused = true while paused stays paused after resume", () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.paused = true;

        manager.resume();
        expect(video.play).not.toHaveBeenCalled();
        expect(sprite.paused).toBe(true);
    });

    test("an explicit VideoSprite.play() while paused waits for resume", () => {
        const { video, texture } = createVideoTexture({ paused: true });
        const sprite = new VideoSprite(texture);
        sprite.pause();
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.play();
        expect(video.play).not.toHaveBeenCalled();
        expect(sprite.paused).toBe(false);
        expect(sprite.memory.paused).toBe(false);

        manager.resume();
        expect(video.play).toHaveBeenCalledTimes(1);
    });

    test("repeated pauses keep the latest requested state", () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        gameLayer.addChild(sprite);

        manager.pause();
        sprite.pause();
        manager.resume();
        manager.pause();
        manager.resume();
        expect(video.play).not.toHaveBeenCalled();

        manager.pause();
        sprite.play();
        manager.resume();
        expect(video.play).toHaveBeenCalledTimes(1);
    });

    test("does not resume videos removed, destroyed or replaced while paused", () => {
        const removed = createVideoTexture();
        const destroyed = createVideoTexture();
        const replaced = createVideoTexture();
        const removedSprite = new VideoSprite(removed.texture);
        const destroyedSprite = new VideoSprite(destroyed.texture);
        const replacedSprite = new VideoSprite(replaced.texture);
        gameLayer.addChild(removedSprite, destroyedSprite, replacedSprite);

        manager.pause();
        gameLayer.removeChild(removedSprite);
        destroyedSprite.destroy();
        replacedSprite.texture = createVideoTexture({ paused: true }).texture;

        manager.resume();
        expect(removed.video.play).not.toHaveBeenCalled();
        expect(destroyed.video.play).not.toHaveBeenCalled();
        expect(replaced.video.play).not.toHaveBeenCalled();
    });

    test("a texture replaced while paused is played directly, not deferred", () => {
        const { texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        gameLayer.addChild(sprite);
        manager.pause();

        const replacement = createVideoTexture({ paused: true });
        sprite.texture = replacement.texture;
        sprite.play();
        expect(replacement.video.play).toHaveBeenCalledTimes(1);
    });

    test("clear discards stale references", () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        gameLayer.addChild(sprite);
        manager.pause();

        manager.clear();
        gameLayer.addChild(sprite);
        manager.resume();
        expect(video.play).not.toHaveBeenCalled();
    });

    test("export while paused saves the requested state without touching the videos", () => {
        const playing = createVideoTexture();
        const stopped = createVideoTexture();
        const film = new VideoSprite(playing.texture);
        const intro = new VideoSprite(stopped.texture);
        film.label = "film";
        intro.label = "intro";
        gameLayer.addChild(film, intro);
        manager.pause();
        intro.pause();
        vi.mocked(playing.video.play).mockClear();
        vi.mocked(playing.video.pause).mockClear();

        const state = manager.export();
        expect((state.elements.film as VideoSpriteMemory).paused).toBe(false);
        expect((state.elements.intro as VideoSpriteMemory).paused).toBe(true);
        expect(gameLayer.renderable).toBe(false);
        expect(playing.video.paused).toBe(true);
        expect(playing.video.play).not.toHaveBeenCalled();
        expect(playing.video.pause).not.toHaveBeenCalled();

        manager.resume();
        expect(playing.video.play).toHaveBeenCalledTimes(1);
        expect(stopped.video.play).not.toHaveBeenCalled();
    });

    test("pauses and resumes a shared video resource once", () => {
        const { video, texture } = createVideoTexture();
        const first = new VideoSprite(texture);
        const second = new VideoSprite(texture);
        const group = new PIXI.Container();
        group.addChild(second);
        gameLayer.addChild(first, group);

        manager.pause();
        expect(video.pause).toHaveBeenCalledTimes(1);

        gameLayer.removeChild(first);
        manager.resume();
        expect(video.play).toHaveBeenCalledTimes(1);

        manager.pause();
        gameLayer.removeChild(group);
        manager.resume();
        expect(video.play).toHaveBeenCalledTimes(1);
    });

    test("on a shared video, the latest explicit request while paused wins", () => {
        const { video, texture } = createVideoTexture();
        const first = new VideoSprite(texture);
        const second = new VideoSprite(texture);
        gameLayer.addChild(first, second);

        manager.pause();
        first.pause();
        expect(second.paused).toBe(true);
        manager.resume();
        expect(video.play).not.toHaveBeenCalled();

        manager.pause();
        first.pause();
        second.play();
        manager.resume();
        expect(video.play).toHaveBeenCalledTimes(1);
    });

    test("sprites sharing a video save the same latest request, while paused and after resume", () => {
        const { texture } = createVideoTexture();
        const first = new VideoSprite(texture);
        const second = new VideoSprite(texture);
        gameLayer.addChild(first, second);
        const savedPaused = () => [first.memory.paused, second.memory.paused];

        manager.pause();
        first.pause();
        expect(savedPaused()).toEqual([true, true]);
        manager.resume();
        expect(savedPaused()).toEqual([true, true]);

        manager.pause();
        second.play();
        expect(savedPaused()).toEqual([false, false]);
        manager.resume();
        expect(savedPaused()).toEqual([false, false]);
    });

    test("paused: true given before the video is loaded is kept and saved", async () => {
        const { video, texture } = createVideoTexture();
        const alias = "canvas-pause-before-load";
        PIXI.Assets.cache.set(alias, texture);
        try {
            const sprite = new VideoSprite({ paused: true }, alias);
            expect(sprite.paused).toBe(true);
            expect(sprite.memory.paused).toBe(true);

            await sprite.load();
            expect(sprite.texture).toBe(texture);
            expect(video.paused).toBe(true);
            expect(sprite.paused).toBe(true);
            expect(sprite.memory.paused).toBe(true);
        } finally {
            PIXI.Assets.cache.remove(alias);
        }
    });

    test("logs a rejected play() without an unhandled rejection, ignoring AbortError", async () => {
        const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
        const blocked = createVideoTexture({ playError: new DOMException("blocked", "NotAllowedError") });
        const aborted = createVideoTexture({ playError: new DOMException("aborted", "AbortError") });
        gameLayer.addChild(new VideoSprite(blocked.texture), new VideoSprite(aborted.texture));

        manager.pause();
        manager.resume();
        await new Promise((resolve) => setTimeout(resolve));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][1]).toMatchObject({ name: "NotAllowedError" });
    });
});
