import { getTexture } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasSprite, getMemorySprite } from "./CanvasSprite";

/**
 * The class for the image.
 * Must use refreshImage() to load the image.
 */
export class CanvasImage extends CanvasSprite {
    constructor(image: string) {
        super()
        this.imageLink = image
    }
    imageLink: string;
    async refreshImage() {
        return getTexture(this.imageLink)
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

export function getMemoryCanvasImage(element: CanvasImage): ICanvasImageMemory {
    let temp = getMemorySprite(element as any)
    return {
        ...temp,
        className: "CanvasImage",
        imageLink: element.imageLink,
    }
}
