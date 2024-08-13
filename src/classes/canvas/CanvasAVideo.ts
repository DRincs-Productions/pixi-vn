import { Sprite, Texture, TextureSourceLike } from "pixi.js";
import ICanvasVideoMemory from "../../interface/canvas/ICanvasVideoMemory";
import CanvasImage from "./CanvasImage";

export const CANVAS_VIDEO_ID = "CanvasVideo"

export default class CanvasVideo extends CanvasImage<ICanvasVideoMemory> {
    pixivnId: string = CANVAS_VIDEO_ID
    override get memory(): ICanvasVideoMemory {
        return {
            ...super.memory,
            pixivnId: this.pixivnId,
            loop: this.loop,
            paused: this.paused,
        }
    }
    override set memory(memory: ICanvasVideoMemory) {
        super.memory = memory
        this.loop = memory.loop
        this.paused = memory.paused
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
        this.paused = this._paused
    }

    private _looop: boolean = false
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
    get paused() {
        return this.texture?.source?.resource?.paused || false
    }
    set paused(value: boolean) {
        this._paused = value
        if (this.texture?.source?.resource) {
            if (value) {
                this.texture.source.resource.pause()
            }
            else {
                this.texture.source.resource.play()
            }
        }
    }
}
