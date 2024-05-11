import { Sprite, Texture, TextureSourceLike } from "pixi.js";
import { getTexture } from "../../functions/TextureUtility";
import ICanvasImageMemory from "../../interface/canvas/ICanvasImageMemory";
import CanvasSprite, { getMemorySprite, setMemorySprite } from "./CanvasSprite";

/**
 * This class is a extension of the CanvasSprite class, it has the same properties and methods,
 * but it has some features that make texture management easier.
 * You need to use CanvasImage.load() to show the image in the canvas.
 * This class is used for functions like addImage, loadImages and showImageWithDissolveTransition.
 * @example
 * ```typescript
 * let alien = new CanvasImage()
 * alien.anchor.set(0.5);
 * alien.x = 100
 * alien.y = 100
 * await alien.load('https://pixijs.com/assets/eggHead.png')
 * GameWindowManager.addCanvasElement("alien", alien)
 * ```
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * alien.x = 100
 * alien.y = 100
 * await alien.load()
 * ```
 */
export default class CanvasImage extends CanvasSprite<ICanvasImageMemory> {
    override get memory(): ICanvasImageMemory {
        return {
            ...getMemorySprite(this),
            className: "CanvasImage",
            textureImage: { image: this.imageLink },
        }
    }
    override set memory(memory: ICanvasImageMemory) {
        setMemorySprite(this, memory)
    }
    imageLink: string = ""
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = Sprite.from(source, skipCache)
        let mySprite = new CanvasImage()
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
}
