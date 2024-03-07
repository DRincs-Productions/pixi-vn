import { getPixiTexture as getTextureOrTextError, getPixiTextureAsync as getTextureOrTextErrorAsync } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasSprite, getMemorySprite } from "./CanvasSprite";

/**
 * The base class for the image.
 */
export abstract class CanvasImageBase extends CanvasSprite<ICanvasImageMemory> {
    imageLink: string
    constructor(options?: ICanvasImageMemory | string) {
        if (typeof options === "string") {
            super()
            this.imageLink = options
        }
        else {
            super(options)
            this.imageLink = options?.imageLink ?? ""
        }
    }
    /**
     * Refresh the image.
     */
    abstract refreshImage(): void
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
            this.texture = texture
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
                    this.texture = texture
                }
            })
            .catch(() => {
                console.error("Error loading image")
                // this.pixiElement.text = "Error loading image"
            })
    }
}

export function getMemoryCanvasImage(element: CanvasImageBase): ICanvasImageMemory {
    let temp = getMemorySprite(element)
    return {
        ...temp,
        className: "CanvasImage",
        imageLink: element.imageLink,
    }
}

export function getMemoryCanvasImageAsync(element: CanvasImageBase): ICanvasImageMemory {
    let temp = getMemorySprite(element)
    return {
        ...temp,
        className: "CanvasImageAsync",
        imageLink: element.imageLink,
    }
}
