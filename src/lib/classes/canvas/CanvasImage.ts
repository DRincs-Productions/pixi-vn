import { getTexture } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasSprite, getMemorySprite } from "./CanvasSprite";
import { CanvasText } from "./CanvasText";

/**
 * The class for the image.
 * Must use refreshImage() to load the image.
 */
export class CanvasImage extends CanvasSprite {
    constructor(image: string) {
        super()
        this.imageLink = image
    }
    errorText?: CanvasText
    imageLink: string;
    async refreshImage() {
        return getTexture(this.imageLink)
            .then((texture) => {
                if (typeof texture === "string") {
                    if (!this.errorText) {
                        this.errorText = new CanvasText()
                        this.addCanvasChild(this.errorText)
                    }
                    this.errorText.text = texture
                }
                else {
                    if (this.errorText) {
                        this.removeChild(this.errorText)
                    }
                    this.texture = texture
                }
            })
            .catch(() => {
                console.error("Error loading image")
                if (!this.errorText) {
                    this.errorText = new CanvasText()
                    this.addCanvasChild(this.errorText)
                }
                this.errorText.text = "Error loading image"
            })
    }
}

export function getMemoryCanvasImage(element: CanvasImage): ICanvasImageMemory {
    let temp = getMemorySprite(element as any)
    return {
        ...temp,
        className: "CanvasImage",
        imageLink: element.imageLink,
    }
}
