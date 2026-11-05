import type { FederatedPointerEvent, Texture } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { RegisteredCanvasComponents, RegisteredEvents, VideoSprite } from "../src/canvas";
import type { VideoSpriteMemory } from "../src/canvas";
import { logger } from "../src/utils/log-utility";

let aliasCounter = 0;

/**
 * A texture whose source resource is a real (jsdom) `HTMLVideoElement`, cached under a unique alias.
 * `play`/`pause` are stubbed because jsdom doesn't implement media playback.
 */
function createVideoTexture(options: { endOnPlay?: boolean } = {}) {
    const alias = `video-sprite-events-${++aliasCounter}`;
    const video = document.createElement("video");
    video.play = vi.fn(() => {
        if (options.endOnPlay) {
            // simulate a video that ends while it is being loaded/restored
            video.dispatchEvent(new Event("ended"));
        }
        return Promise.resolve();
    });
    video.pause = vi.fn();
    const texture: Texture = new PIXI.Texture({
        source: new PIXI.TextureSource({ resource: video, width: 8, height: 8, label: alias }),
    });
    PIXI.Assets.cache.set(alias, texture);
    return { alias, video, texture };
}

function endVideo(video: HTMLVideoElement) {
    video.dispatchEvent(new Event("ended"));
}

function countEndedListeners(spy: { mock: { calls: any[][] } }) {
    return spy.mock.calls.filter(([event]) => event === "ended").length;
}

afterEach(() => vi.restoreAllMocks());

describe("VideoSprite ended event", () => {
    test("emits ended with the component as listener argument (constructor texture)", () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        const handler = vi.fn((component: VideoSprite) => {
            expect(component).toBe(sprite);
        });
        sprite.on("ended", handler);

        endVideo(video);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(sprite);
    });

    test("emits ended for a sprite created with VideoSprite.from", () => {
        const { video, texture } = createVideoTexture();
        const sprite = VideoSprite.from(texture);
        expect(sprite).toBeInstanceOf(VideoSprite);
        const handler = vi.fn();
        sprite.on("ended", handler);

        endVideo(video);
        expect(handler).toHaveBeenCalledWith(sprite);
    });

    test("emits ended after load(), and load() is silent", async () => {
        const { alias, video } = createVideoTexture({ endOnPlay: true });
        const sprite = new VideoSprite(undefined, alias);
        const handler = vi.fn();
        sprite.on("ended", handler);

        await sprite.load();
        // load() plays the video, which ends immediately: the event is silenced
        expect(video.play).toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();

        endVideo(video);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(sprite);
    });

    test("repeated load() of the same video doesn't duplicate the listener", async () => {
        const { alias, video } = createVideoTexture();
        const addSpy = vi.spyOn(video, "addEventListener");
        const sprite = new VideoSprite(undefined, alias);
        const handler = vi.fn();
        sprite.on("ended", handler);

        await sprite.load();
        await sprite.load();
        const sameTexture = sprite.texture;
        sprite.texture = sameTexture;
        expect(countEndedListeners(addSpy)).toBe(1);

        endVideo(video);
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("replacing the texture detaches the old video and attaches the new one", () => {
        const first = createVideoTexture();
        const second = createVideoTexture();
        const removeSpy = vi.spyOn(first.video, "removeEventListener");
        // the first listener is attached by the superclass constructor, before the class fields
        // are initialized: it must still be tracked and detached
        const sprite = new VideoSprite(first.texture);
        const handler = vi.fn();
        sprite.on("ended", handler);

        sprite.texture = second.texture;
        expect(countEndedListeners(removeSpy)).toBe(1);
        endVideo(first.video);
        expect(handler).not.toHaveBeenCalled();
        endVideo(second.video);
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("tolerates empty and non-video textures", () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite();
        const handler = vi.fn();
        sprite.on("ended", handler);
        expect(sprite.haveEmptyTexture).toBe(true);

        const canvasElement = document.createElement("canvas");
        const imageTexture = new PIXI.Texture({
            source: new PIXI.TextureSource({ resource: canvasElement, width: 8, height: 8 }),
        });
        expect(() => (sprite.texture = imageTexture)).not.toThrow();
        sprite.texture = texture;
        sprite.texture = PIXI.Texture.EMPTY;
        endVideo(video);
        expect(handler).not.toHaveBeenCalled();
    });

    test("destroy() detaches the listener", () => {
        const { video, texture } = createVideoTexture();
        const removeSpy = vi.spyOn(video, "removeEventListener");
        const sprite = new VideoSprite(texture);
        const handler = vi.fn();
        sprite.on("ended", handler);

        sprite.destroy();
        expect(countEndedListeners(removeSpy)).toBe(1);
        endVideo(video);
        expect(handler).not.toHaveBeenCalled();
    });

    test("a registered listener is saved, restored silently and still emitted after the restore", async () => {
        const handler = vi.fn();
        RegisteredEvents.add(handler, "video-sprite-test-ended");
        const { alias, video } = createVideoTexture({ endOnPlay: true });
        const sprite = new VideoSprite(undefined, alias);
        sprite.on("ended", handler);
        await sprite.load();

        const memory = JSON.parse(JSON.stringify(sprite.memory)) as VideoSpriteMemory;
        expect(memory.onEvents).toEqual({ ended: "video-sprite-test-ended" });
        // the restored sprite shares the cached video element: only the restored one must listen
        sprite.destroy();
        handler.mockClear();

        const restored = (await RegisteredCanvasComponents.getInstance(
            memory.pixivnId,
            memory,
        )) as VideoSprite;
        expect(restored).toBeInstanceOf(VideoSprite);
        expect(restored.texture.source.resource).toBe(video);
        // the restore plays the video, which ends immediately: the event is silenced
        expect(handler).not.toHaveBeenCalled();

        endVideo(video);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(restored);
    });

    test("setMemory() is silent for its whole operation", async () => {
        const { video, texture } = createVideoTexture({ endOnPlay: true });
        const sprite = new VideoSprite(texture);
        const handler = vi.fn();
        sprite.on("ended", handler);

        await sprite.setMemory({ ...sprite.memory, paused: false });
        expect(video.play).toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();
    });

    test("RegisteredCanvasComponents.copyProperty silences ended fired by paused: false, events work after", async () => {
        const { video, texture } = createVideoTexture({ endOnPlay: true });
        const sprite = new VideoSprite(texture);
        const handler = vi.fn();
        sprite.on("ended", handler);

        const memory: VideoSpriteMemory = { ...sprite.memory, paused: false };
        await RegisteredCanvasComponents.copyProperty(sprite.pixivnId, sprite, memory);
        // applying paused: false plays the video, which ends immediately: the event is silenced
        expect(video.play).toHaveBeenCalled();
        expect(handler).not.toHaveBeenCalled();

        endVideo(video);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(sprite);
    });

    test("concurrent silent operations keep the events silenced until the last one ends", async () => {
        const { video, texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        const handler = vi.fn();
        sprite.on("ended", handler);

        let releaseFirst!: () => void;
        let releaseSecond!: () => void;
        const first = sprite.withSilentEvents(() => new Promise<void>((r) => (releaseFirst = r)));
        const second = sprite.withSilentEvents(() => new Promise<void>((r) => (releaseSecond = r)));

        releaseFirst();
        await first;
        endVideo(video);
        expect(handler).not.toHaveBeenCalled();

        releaseSecond();
        await second;
        endVideo(video);
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("listeners are contextually typed", () => {
        // the extra member keeps MyVideo from being structurally equal to VideoSprite
        class MyVideo extends VideoSprite {
            readonly myVideo = true;
        }
        const sprite = new MyVideo();
        sprite.on("ended", (component) => {
            expectTypeOf(component).toEqualTypeOf<MyVideo>();
        });
        sprite.on("pointerdown", (event, component) => {
            expectTypeOf(event).toEqualTypeOf<FederatedPointerEvent>();
            expectTypeOf(component).toEqualTypeOf<MyVideo>();
        });
    });

    test("custom string and symbol events receive their arguments followed by the component", () => {
        const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
        const sprite = new VideoSprite();
        const symbolEvent = Symbol("my-symbol-event");
        const received: unknown[][] = [];
        // unregistered listeners: they warn (not saved) but still work
        sprite.on("my-custom-event", (...args) => received.push(args));
        sprite.on(symbolEvent, (...args) => received.push(args));
        const listenerWarnings = warn.mock.calls
            .map(([message]) => String(message))
            .filter((message) => message.includes("not registered with the eventDecorator"));
        expect(listenerWarnings).toHaveLength(2);
        expect(listenerWarnings[1]).toContain('"Symbol(my-symbol-event)"');

        sprite.emit("my-custom-event", 42);
        sprite.emit(symbolEvent, "a", "b");
        expect(received).toEqual([
            [42, sprite],
            ["a", "b", sprite],
        ]);
    });

    test("pointer events are not silenced", async () => {
        const { texture } = createVideoTexture();
        const sprite = new VideoSprite(texture);
        const pointer = vi.fn();
        sprite.on("pointerdown", pointer);

        await sprite.withSilentEvents(() => {
            sprite.emit("pointerdown", {} as any);
        });
        expect(pointer).toHaveBeenCalledTimes(1);
    });
});
