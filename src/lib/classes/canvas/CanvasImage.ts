import { Sprite } from "pixi.js";
import { getPixiTexture as getTextureOrTextError, getPixiTextureAsync as getTextureOrTextErrorAsync } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasSprite } from "./CanvasSprite";

/**
 * The base class for the image.
 */
export abstract class CanvasImageBase extends CanvasSprite<Sprite, ICanvasImageMemory> {
    imageLink: string
    constructor(image: string) {
        let element = new Sprite() // TODO add loader animation
        super(element)
        this.imageLink = image
    }
    /**
     * Refresh the image.
     */
    abstract refreshImage(): void
    get memory(): ICanvasImageMemory {
        return {
            ...super.memorySprite,
            imageLink: this.imageLink,
        }
    }
    set memory(value: ICanvasImageMemory) {
        super.memorySprite = value
        this.imageLink = value.imageLink
        this.refreshImage()
    }
}

/**
 * The class for the image.
 */
export class CanvasImage extends CanvasImageBase {
    constructor(image: string) {
        super(image)
        this.refreshImage()
    }
    refreshImage() {
        let texture = getTextureOrTextError(this.imageLink)
        if (typeof texture === "string") {
            // this.pixiElement.text = texture
        }
        else {
            // this.pixiElement.text = ""
            this.view.texture = texture
        }
    }
}

/**
 * The class for the image, but asynchronously.
 * Must use refreshImage() to load the image.
 */
export class CanvasImageAsync extends CanvasImageBase {
    async refreshImage() {
        getTextureOrTextErrorAsync(this.imageLink)
            .then((texture) => {
                if (typeof texture === "string") {
                    // this.pixiElement.text = texture
                }
                else {
                    // this.pixiElement.text = ""
                    this.view.texture = texture
                }
            })
            .catch(() => {
                console.error("Error loading image")
                // this.pixiElement.text = "Error loading image"
            })
    }
}
