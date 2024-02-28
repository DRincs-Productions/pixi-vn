import { getImageSprite, getImageSpriteAsync } from "../functions/ImageUtility";
import { CanvasContainer, IContainerMemory } from "./ContainerST";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export interface CanvasImageMemory extends IContainerMemory {
    imageLink: string
}

/**
 * The base class for the image.
 */
abstract class CanvasImageBase extends CanvasContainer {
    imageLink: string
    constructor(image: string) {
        super()
        this.imageLink = image
        this.updateImage(image)
    }
    /**
     * Update the image of the element.
     * @param image is the url of the image.
     */
    abstract updateImage(image: string): void
    override get memory(): CanvasImageMemory {
        let memory = super.memory
        return {
            ...memory,
            imageLink: this.imageLink
        }
    }
    override set memory(value: CanvasImageMemory) {
        this.updateImage(value.imageLink)
        super.memory = value
    }
}

/**
 * The class for the image.
 */
export class CanvasImage extends CanvasImageBase {
    updateImage(image: string) {
        this.imageLink = image
        let element = getImageSprite(image)
        this.addChild(element)
    }
}

/**
 * The class for the image, but asynchronously.
 */
export class CanvasImageAsync extends CanvasImageBase {
    updateImage(image: string): void {
        this.imageLink = image
        getImageSpriteAsync(image)
            .then((element) => {
                this.addChild(element)
            })
            .catch(() => {
                console.error("Error loading image")
            })
    }
}
