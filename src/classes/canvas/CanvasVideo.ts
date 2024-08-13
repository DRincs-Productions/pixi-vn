import { Sprite, Texture, TextureSourceLike } from "pixi.js";
import { getTexture } from "../../functions";
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
    /** 
     * Load the image from the link and set the texture of the sprite.
     * @param image The link of the image. If it is not set, it will use the imageLink property.
     * @returns A promise that resolves when the image is loaded.
     */
    async load(image?: string) {
        if (!image) {
            image = this.imageLink
        }
        return getTexture(this.imageLink)
            .then((texture) => {
                if (texture) {
                    this.texture = texture
                }
            })
            .catch((e) => {
                console.error("[Pixi'VN] Error into CanvasImage.load()", e)
            })
    }

    set loop(value: boolean) {
        if (value) {
            (this.texture.source as any).onseeked = function () {
                this.update()
            };
        }
    }
    get loop() {
        return true
    }
}
