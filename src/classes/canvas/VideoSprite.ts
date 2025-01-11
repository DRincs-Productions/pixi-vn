import { Sprite as PixiSprite, Texture, TextureSourceLike } from "pixi.js";
import { CANVAS_VIDEO_ID } from "../../constants";
import { addVideo, showWithDissolve } from "../../functions";
import { VideoSpriteMemory, VideoSpriteOptions } from "../../interface";
import ImageSprite, { setMemoryImageSprite } from "./ImageSprite";

/**
 * This class is a extension of the {@link ImageSprite} class, it has the same properties and methods,
 * but it has some features that make video management easier.
 * You need to use {@link VideoSprite.load()} to show the video in the canvas.
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
        let loop = undefined
        let paused = undefined
        let currentTime = undefined
        if (options && "loop" in options && options?.loop !== undefined) {
            loop = options.loop
            delete options.loop
        }
        if (options && "paused" in options && options?.paused !== undefined) {
            paused = options.paused
            delete options.paused
        }
        if (options && "currentTime" in options && options?.currentTime !== undefined) {
            currentTime = options.currentTime
            delete options.currentTime
        }
        super(options, textureAlias)
        if (loop) {
            this.loop = loop
        }
        if (paused) {
            this.paused = paused
        }
        if (currentTime) {
            this.currentTime = currentTime
        }
    }
    pixivnId: string = CANVAS_VIDEO_ID
    override get memory(): VideoSpriteMemory {
        return {
            ...super.memory,
            pixivnId: this.pixivnId,
            loop: this.loop,
            paused: this._paused,
            currentTime: this.currentTime,
        }
    }
    override set memory(_value: VideoSpriteMemory) { }
    override async setMemory(value: VideoSpriteMemory) {
        this.memory = value
        return await setMemoryVideoSprite(this, value)
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = PixiSprite.from(source, skipCache)
        let mySprite = new VideoSprite()
        mySprite.texture = sprite.texture
        return mySprite
    }

    override async load() {
        await super.load()
        this.loop = this._looop
        this.currentTime = this._currentTime
        this.paused = this._paused
    }

    private _looop: boolean = false
    /**
     * Set to true if you want the video to loop.
     */
    get loop() {
        return this.texture?.source?.resource?.loop || false
    }
    set loop(value: boolean) {
        this._looop = value
        if (this.texture?.source?.resource) {
            this.texture.source.resource.loop = value
        }
    }

    private _paused: boolean = false
    /**
     * Set to true if you want the video to be paused.
     */
    get paused() {
        return this.texture?.source?.resource?.paused || false
    }
    set paused(value: boolean) {
        if (value) {
            this.pause()
        }
        else {
            this.play()
        }
    }
    /**
     * Pause the video.
     */
    pause() {
        this._paused = true
        if (this.texture?.source?.resource) {
            this.texture.source.resource.pause();
        }
    }
    /**
     * Play the video.
     */
    play() {
        this._paused = false
        if (this.texture?.source?.resource) {
            this.texture.source.resource.play();
        }
    }

    private _currentTime: number = 0
    /**
     * The current time of the video.
     */
    get currentTime(): number {
        return this.texture?.source?.resource?.currentTime || 0
    }
    set currentTime(value: number) {
        let duration = this.duration
        if (duration && value >= duration) {
            value = 0
        }
        this._currentTime = value
        if (this.texture?.source?.resource) {
            this.texture.source.resource.currentTime = value
        }
    }

    /**
     * Restart the video.
     */
    restart() {
        this.currentTime = 0
    }

    /**
     * The duration of the video.
     */
    get duration(): number | undefined {
        if (this.texture?.source?.resource) {
            return this.texture.source.resource.duration || 0
        }
    }
}

export async function setMemoryVideoSprite(element: VideoSprite, memory: VideoSpriteMemory | {}, options?: {
    ignoreTexture?: boolean,
}) {
    await setMemoryImageSprite(element, memory, { ignoreTexture: options?.ignoreTexture })
    "loop" in memory && memory.loop !== undefined && (element.loop = memory.loop)
    "currentTime" in memory && memory.currentTime !== undefined && (element.currentTime = memory.currentTime)
    "paused" in memory && memory.paused !== undefined && (element.paused = memory.paused)
}
