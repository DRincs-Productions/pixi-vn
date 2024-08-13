import { Sprite, Texture, TextureSourceLike } from "pixi.js";
import ICanvasImageMemory from "../../interface/canvas/ICanvasImageMemory";
import CanvasImage from "./CanvasImage";

export const CANVAS_VIDEO_ID = "CanvasVideo"

export default class CanvasVideo extends CanvasImage {
    pixivnId: string = CANVAS_VIDEO_ID
    override get memory(): ICanvasImageMemory {
        return {
            ...super.memory,
            pixivnId: this.pixivnId,
            imageLink: this.imageLink,
        }
    }
    override set memory(memory: ICanvasImageMemory) {
        super.memory = memory
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = Sprite.from(source, skipCache)
        let mySprite = new CanvasVideo()
        mySprite.texture = sprite.texture
        return mySprite
    }
}
