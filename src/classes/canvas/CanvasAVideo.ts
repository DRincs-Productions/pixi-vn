import { Sprite, Texture, TextureSourceLike } from "pixi.js";
import { addVideo, loadVideo, showWithDissolveTransition } from "../../functions";
import { ICanvasVideoMemory } from "../../interface";
import CanvasImage from "./CanvasImage";

export const CANVAS_VIDEO_ID = "Video"

/**
 * This class is a extension of the {@link CanvasImage} class, it has the same properties and methods,
 * but it has some features that make video management easier.
 * You need to use {@link CanvasVideo.load()} to show the video in the canvas.
 * This class is used for functions like {@link addVideo}, {@link loadVideo} and {@link showWithDissolveTransition}.
 * @example
 * ```typescript
 * let film = new CanvasVideo({
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
export default class CanvasVideo extends CanvasImage<ICanvasVideoMemory> {
    pixivnId: string = CANVAS_VIDEO_ID
    override get memory(): ICanvasVideoMemory {
        return {
            ...super.memory,
            pixivnId: this.pixivnId,
            loop: this.loop,
            paused: this.paused,
            currentTime: this.currentTime,
        }
    }
    override set memory(memory: ICanvasVideoMemory) {
        super.memory = memory
        this.loop = memory.loop
        this.currentTime = memory.currentTime
        this.paused = memory.paused
        this.load()
    }
    set videoLink(value: string) {
        this.imageLink = value
    }
    get videoLink() {
        return this.imageLink
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = Sprite.from(source, skipCache)
        let mySprite = new CanvasVideo()
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
