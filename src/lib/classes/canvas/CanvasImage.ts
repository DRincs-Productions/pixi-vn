import { Sprite } from "pixi.js";
import { getImageSprite, getImageSpriteAsync } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasContainerBase } from "./CanvasContainer";
import { CanvasSprite } from "./CanvasSprite";

/**
 * The base class for the image.
 */
abstract class CanvasImageBase extends CanvasContainerBase<Sprite, ICanvasImageMemory> {
    imageLink: string
    constructor(image: string) {
        let element = new Sprite() // TODO add loader animation
        super(element)
        this.imageLink = image
        this.updateImage(image)
    }
    /**
     * Update the image of the element.
     * @param image is the url of the image.
     * @returns the sprite of the image.
     */
    abstract updateImage(image: string): CanvasSprite | Promise<CanvasSprite>
    get memory(): ICanvasImageMemory {
        return {
            ...super.memoryContainer,
            imageLink: this.imageLink,
        }
    }
    abstract get className(): string
    set memory(value: ICanvasImageMemory) {
        super.memoryContainer = value
        this.updateImage(value.imageLink)
    }
}

/**
 * The class for the image.
 */
export class CanvasImage extends CanvasImageBase {
    get className(): string {
        return this.constructor.name
    }
    updateImage(image: string): CanvasSprite {
        this.imageLink = image
        let element = getImageSprite(image)
        this.addChild(element)
        return element
    }
}

/**
 * The class for the image, but asynchronously.
 */
export class CanvasImageAsync extends CanvasImageBase {
    get className(): string {
        return this.constructor.name
    }
    async updateImage(image: string): Promise<CanvasSprite> {
        this.imageLink = image
        return getImageSpriteAsync(image)
            .then((element) => {
                this.addChild(element)
                return element
            })
            .catch(() => {
                console.error("Error loading image")
                return new CanvasSprite()
            })
    }
}
