import { EventSuppressor } from "@canvas/components/EventSuppressor";
import ImageSprite, { setMemoryImageSprite } from "@canvas/components/ImageSprite";
import type { ListenerEventArgs, ListenerEventName } from "@canvas/components/ListenerExtension";
import RegisteredCanvasComponents from "@canvas/decorators/canvas-element-decorator";
import type { showWithDissolve } from "@canvas/functions/canvas-transition";
import type { addVideo } from "@canvas/functions/video-utility";
import type AssetMemory from "@canvas/interfaces/AssetMemory";
import type { VideoSpriteOptions } from "@canvas/interfaces/canvas-options";
import type VideoSpriteMemory from "@canvas/interfaces/memory/VideoSpriteMemory";
import { getVideoElement, systemPausedVideos } from "@canvas/functions/media-system-pause";
import { CANVAS_VIDEO_ID } from "@constants";
import type {
    DestroyOptions,
    Texture,
    TextureSource,
    TextureSourceLike,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";

/**
 * The savable events of a {@link VideoSprite}, in addition to the PixiJS container events:
 * - `"ended"`: the video reached its end (the `ended` event of the `HTMLVideoElement`); the listener
 *   receives `(component)`. Looping videos never emit it.
 *
 * They are not emitted while the video is loaded or a save is restored.
 */
export type VideoSpriteEventType = "ended";

/**
 * The `ended` listener of each sprite's `HTMLVideoElement`. It lives outside the instance because the
 * superclass constructor calls the texture setter before the class fields are initialized.
 */
const videoEndedBindings = new WeakMap<
    VideoSprite,
    { resource: HTMLVideoElement; listener: () => void }
>();

function detachVideoEndedListener(sprite: VideoSprite) {
    const binding = videoEndedBindings.get(sprite);
    if (binding) {
        binding.resource.removeEventListener("ended", binding.listener);
        videoEndedBindings.delete(sprite);
    }
}

/**
 * This class is a extension of the {@link ImageSprite} class, it has the same properties and methods,
 * but it has some features that make video management easier.
 * You need to use {@link load} to show the video in the canvas.
 * This class is used for functions like {@link addVideo} and {@link showWithDissolve}.
 *
 * Listen to the `"ended"` event (see {@link VideoSpriteEventType}) with a handler registered with
 * `eventDecorator`, so it is saved:
 * ```ts
 * class Events {
 *     \@eventDecorator()
 *     static removeFilm(component: VideoSprite) {
 *         canvas.remove(component.label);
 *     }
 * }
 * film.on("ended", Events.removeFilm);
 * ```
 * @example
 * ```ts
 * Assets.add({ alias: "film", src: "https://pixijs.com/assets/video.mp4" });
 *
 * const film = new VideoSprite({ x: 100, y: 100 }, "film");
 * await film.load();
 * canvas.add("film", film);
 * ```
 * @example
 * ```ts
 * Assets.add({ alias: "film", src: "https://pixijs.com/assets/video.mp4" });
 *
 * // the alias of the component is also the alias of the asset
 * const film = addVideo("film", { loop: true });
 * film.currentTime = 2;
 * await film.load();
 * // a different alias for the component
 * const film2 = await showVideo("film2", "film", { xAlign: 1 });
 * ```
 */
export default class VideoSprite extends ImageSprite<VideoSpriteMemory> {
    /**
     * @param options The options for the component.
     * @param textureAlias The URL or path. If you have initialized the "asset matrix", you can use the alias of the texture.
     */
    constructor(options?: VideoSpriteOptions | Texture | undefined, textureAlias?: string) {
        if (options instanceof PIXI.Texture) {
            super(options, textureAlias);
            return;
        }
        const { loop, paused, currentTime, ...restOptions } = options || {};
        super(restOptions, textureAlias);
        if (loop) {
            this.loop = loop;
        }
        if (paused) {
            this.paused = paused;
        }
        if (currentTime) {
            this.currentTime = currentTime;
        }
    }
    readonly pixivnId: string = CANVAS_VIDEO_ID;
    override get memory(): VideoSpriteMemory {
        return {
            ...super.memory,
            pixivnId: this.pixivnId,
            loop: this.loop,
            paused: this.paused,
            currentTime: this.currentTime,
        };
    }
    override async setMemory(value: VideoSpriteMemory) {
        await this.withSilentEvents(async () => {
            await setMemoryVideoSprite(this, value);
            this.reloadPosition();
        });
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        const sprite = PIXI.Sprite.from(source, skipCache);
        const mySprite = new VideoSprite();
        mySprite.texture = sprite.texture;
        return mySprite;
    }

    /**
     * Load the video and set the texture of the sprite. The video events are not emitted during the loading.
     * @returns A promise that resolves when the video is loaded.
     */
    override async load() {
        await this.withSilentEvents(async () => {
            await super.load();
            this.loop = this._looop;
            this.currentTime = this._currentTime;
            this.paused = this._paused;
        });
    }

    /** Video events */

    private readonly _eventSuppressor = new EventSuppressor();
    /**
     * Run `fn` without emitting the video events (see {@link VideoSpriteEventType}).
     * @internal
     */
    async withSilentEvents<T>(fn: () => Promise<T> | T): Promise<T> {
        return this._eventSuppressor.run(fn);
    }
    /**
     * Move the `ended` listener to the video element of the current texture, if it changed.
     * Called by the superclass constructor too, so it must not rely on the fields of this class.
     */
    private syncVideoEndedListener() {
        const resource = this.destroyed ? undefined : getVideoElement(this.texture);
        if (videoEndedBindings.get(this)?.resource === resource) {
            return;
        }
        detachVideoEndedListener(this);
        if (resource) {
            const listener = () => this._eventSuppressor.emit(this, "ended");
            resource.addEventListener("ended", listener);
            videoEndedBindings.set(this, { resource, listener });
        }
    }

    override set texture(value: Texture<TextureSource<any>>) {
        super.texture = value;
        this.syncVideoEndedListener();
    }
    override get texture(): Texture<TextureSource<any>> {
        return super.texture;
    }

    override destroy(options?: DestroyOptions): void {
        detachVideoEndedListener(this);
        super.destroy(options);
    }

    /**
     * Add a listener for the `"ended"` video event. Register the listener with `eventDecorator` to save it.
     */
    override on(event: VideoSpriteEventType, fn: (component: this) => void, context?: any): this;
    override on<T extends ListenerEventName>(
        event: T,
        fn: (...args: ListenerEventArgs<T, this>) => void,
        context?: any,
    ): this;
    override on(event: any, fn: (...args: any[]) => void, context?: any): this {
        // Sprite.on records the handler and appends the component
        return super.on(event, fn as any, context);
    }

    private _looop: boolean = false;
    /**
     * Set to true if you want the video to loop.
     */
    get loop() {
        return this.texture?.source?.resource?.loop || false;
    }
    set loop(value: boolean) {
        this._looop = value;
        if (this.texture?.source?.resource) {
            this.texture.source.resource.loop = value;
        }
    }

    private _paused: boolean = false;
    /**
     * The suspension applied by `canvas.pause()` to the video of this sprite, if any.
     */
    private get systemPauseState() {
        const video = getVideoElement(this.texture);
        return video && systemPausedVideos.get(video);
    }
    /**
     * Set to true if you want the video to be paused. This is also the state saved by {@link memory}.
     *
     * It reflects the video element, which is shared by every sprite showing it. While `canvas.pause()`
     * suspends the video, it is the requested playback state (the one `canvas.resume()` will apply),
     * not the temporary suspension. Before the video is loaded, it is the value that {@link load} applies.
     */
    get paused() {
        const video = getVideoElement(this.texture);
        if (!video) {
            return this._paused;
        }
        const suspended = systemPausedVideos.get(video);
        return suspended ? !suspended.play : video.paused;
    }
    set paused(value: boolean) {
        if (value) {
            this.pause();
        } else {
            this.play();
        }
    }
    /**
     * Pause the video. If the video is suspended by `canvas.pause()`, it stays paused after `canvas.resume()`.
     */
    pause() {
        this._paused = true;
        const suspended = this.systemPauseState;
        if (suspended) {
            suspended.play = false;
        }
        if (this.texture?.source?.resource) {
            this.texture.source.resource.pause();
        }
    }
    /**
     * Play the video. If this sprite is suspended by `canvas.pause()`, the video starts playing on `canvas.resume()`.
     */
    play() {
        this._paused = false;
        const suspended = this.systemPauseState;
        if (suspended) {
            suspended.play = true;
            if (suspended.sprites.includes(this)) {
                return;
            }
        }
        if (
            this.texture?.source?.resource?.play &&
            typeof this.texture.source.resource.play === "function"
        ) {
            this.texture.source.resource.play();
        }
    }

    private _currentTime: number = 0;
    /**
     * The current time of the video.
     */
    get currentTime(): number {
        return this.texture?.source?.resource?.currentTime || 0;
    }
    set currentTime(value: number) {
        const duration = this.duration;
        if (duration && value >= duration) {
            value = 0;
        }
        this._currentTime = value;
        if (this.texture?.source?.resource) {
            this.texture.source.resource.currentTime = value;
        }
    }

    /**
     * Restart the video.
     */
    restart() {
        this.currentTime = 0;
    }

    /**
     * The duration of the video.
     */
    get duration(): number | undefined {
        if (this.texture?.source?.resource) {
            return this.texture.source.resource.duration || 0;
        }
        return undefined;
    }
}
RegisteredCanvasComponents.add<VideoSpriteMemory, typeof VideoSprite>(VideoSprite, {
    name: CANVAS_VIDEO_ID,
    getInstance: async (type, memory) => {
        let textureData: AssetMemory | undefined;
        if ("textureData" in memory && memory.textureData) {
            textureData = memory.textureData;
        }
        const instance = new type(undefined, textureData?.alias);
        await instance.setMemory(memory);
        return instance;
    },
    copyProperty: async (component, source) => {
        await setMemoryVideoSprite(component as VideoSprite, source, { ignoreTexture: true });
    },
});

export async function setMemoryVideoSprite(
    element: VideoSprite,
    memory: Partial<VideoSpriteMemory>,
    options?: {
        ignoreTexture?: boolean;
    },
) {
    await element.withSilentEvents(async () => {
        await setMemoryImageSprite(element, memory, { ignoreTexture: options?.ignoreTexture });
        if ("loop" in memory && memory.loop !== undefined) element.loop = memory.loop;
        if ("currentTime" in memory && memory.currentTime !== undefined)
            element.currentTime = memory.currentTime;
        if ("paused" in memory && memory.paused !== undefined) element.paused = memory.paused;
    });
}
