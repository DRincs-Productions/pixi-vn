import { Sprite as PixiSprite, SpriteOptions, Texture, TextureSourceLike } from "pixi.js";
import { addImage, loadImage, showWithDissolveTransition } from "../../functions";
import { getTexture } from "../../functions/texture-utility";
import { SpriteImageMemory } from "../../interface";
import Sprite, { getMemorySprite, setMemorySprite } from "./Sprite";

export const CANVAS_IMAGE_ID = "Image"

/**
 * This class is a extension of the {@link Sprite} class, it has the same properties and methods,
 * but it has some features that make texture management easier.
 * You need to use {@link SpriteImage.load()} to show the image in the canvas.
 * This class is used for functions like {@link addImage}, {@link loadImage} and {@link showWithDissolveTransition}.
 * @example
 * ```typescript
 * let alien = new SpriteImage({
 *     anchor: { x: 0.5, y: 0.5 },
 *     x: 100,
 *     y: 100,
 * }, 'https://pixijs.com/assets/eggHead.png')
 * await alien.load()
 * canvas.add("alien", alien)
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
export default class SpriteImage<Memory extends SpriteImageMemory = SpriteImageMemory> extends Sprite<Memory> {
    pixivnId: string = CANVAS_IMAGE_ID
    constructor(options?: SpriteOptions | Texture | undefined, imageLink?: string) {
        super(options)
        if (imageLink) {
            this.imageLink = imageLink
        }
    }
    override get memory(): SpriteImageMemory {
        return {
            ...getMemorySprite(this),
            pixivnId: this.pixivnId,
            imageLink: this.imageLink,
        }
    }
    override set memory(memory: SpriteImageMemory) {
        setMemorySprite(this, memory)
        this.imageLink = memory.imageLink
    }
    imageLink: string = ""
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = PixiSprite.from(source, skipCache)
        let mySprite = new SpriteImage()
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
                console.error("[Pixi’VN] Error into SpriteImage.load()", e)
            })
    }
}
