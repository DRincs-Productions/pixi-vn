import { Sprite } from "pixi.js";
import { getPixiImageSprite, getPixiImageSpriteAsync } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasContainerBase } from "./CanvasContainer";

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
    abstract updateImage(image: string): void
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
    updateImage(image: string) {
        this.imageLink = image
        this.pixiElement = getPixiImageSprite(image).pixiElement
    }
}

/**
 * The class for the image, but asynchronously.
 */
export class CanvasImageAsync extends CanvasImageBase {
    get className(): string {
        return this.constructor.name
    }
    async updateImage(image: string) {
        this.imageLink = image
        getPixiImageSpriteAsync(image)
            .then((element) => {
                this.pixiElement = element.pixiElement
            })
            .catch(() => {
                console.error("Error loading image")
                this.pixiElement = new Sprite()
            })
    }
}
