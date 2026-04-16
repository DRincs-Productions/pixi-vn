import ImageSprite, { setMemoryImageSprite } from "@canvas/components/ImageSprite";
import RegisteredCanvasComponents from "@canvas/decorators/canvas-element-decorator";
import type { showWithDissolve } from "@canvas/functions/canvas-transition";
import type { addVideo } from "@canvas/functions/video-utility";
import type AssetMemory from "@canvas/interfaces/AssetMemory";
import type { VideoSpriteOptions } from "@canvas/interfaces/canvas-options";
import type VideoSpriteMemory from "@canvas/interfaces/memory/VideoSpriteMemory";
import { CANVAS_VIDEO_ID } from "@constants";
import type { Texture, TextureSourceLike } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";

/**
 * This class is a extension of the {@link ImageSprite} class, it has the same properties and methods,
 * but it has some features that make video management easier.
 * You need to use {@link load} to show the video in the canvas.
 * This class is used for functions like {@link addVideo} and {@link showWithDissolve}.
 * @example
 * ```typescript
 * let film = new VideoSprite({
 *     x: 100,
 *     y: 100,
 * }, 'https://pixijs.com/assets/video.mp4')
 * await film.load()
 * canvas.add("film", film)
 * ```
 * @example
 * ```typescript
 * let film = addVideo("film", 'https://pixijs.com/assets/video.mp4')
 * film.currentTime = 2
 * await film.load()
 * ```
 */
export default class VideoSprite extends ImageSprite<VideoSpriteMemory> {
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
            paused: this._paused,
            currentTime: this.currentTime,
        };
    }
    override async setMemory(value: VideoSpriteMemory) {
        await setMemoryVideoSprite(this, value);
        this.reloadPosition();
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        const sprite = PIXI.Sprite.from(source, skipCache);
        const mySprite = new VideoSprite();
        mySprite.texture = sprite.texture;
        return mySprite;
    }

    override async load() {
        await super.load();
        this.loop = this._looop;
        this.currentTime = this._currentTime;
        this.paused = this._paused;
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
     * Set to true if you want the video to be paused.
     */
    get paused() {
        return this.texture?.source?.resource?.paused || false;
    }
    set paused(value: boolean) {
        if (value) {
            this.pause();
        } else {
            this.play();
        }
    }
    /**
     * Pause the video.
     */
    pause() {
        this._paused = true;
        if (this.texture?.source?.resource) {
            this.texture.source.resource.pause();
        }
    }
    /**
     * Play the video.
     */
    play() {
        this._paused = false;
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
    memory: VideoSpriteMemory | {},
    options?: {
        ignoreTexture?: boolean;
    },
) {
    await setMemoryImageSprite(element, memory, { ignoreTexture: options?.ignoreTexture });
    "loop" in memory && memory.loop !== undefined && (element.loop = memory.loop);
    "currentTime" in memory &&
        memory.currentTime !== undefined &&
        (element.currentTime = memory.currentTime);
    "paused" in memory && memory.paused !== undefined && (element.paused = memory.paused);
}
