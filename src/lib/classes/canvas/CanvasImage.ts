import { canvasElementDecorator } from "../../decorators/CanvasElementDecorator";
import { getTexture } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasSprite, getMemorySprite, setMemorySprite } from "./CanvasSprite";

/**
 * The class for the image.
 * Must use refreshImage() to load the image.
 */
@canvasElementDecorator()
export class CanvasImage extends CanvasSprite<ICanvasImageMemory> {
    override get memory(): ICanvasImageMemory {
        return getMemoryCanvasImage(this)
    }
    override set memory(memory: ICanvasImageMemory) {
        setMemoryCanvasImage(this, memory)
    }
    imageLink: string = ""
    async refreshImage() {
        return getTexture(this.imageLink)
            .then((texture) => {
                if (typeof texture === "string") {
                    console.error("Error loading image")
                }
                else {
                    this.texture = texture
                }
            })
            .catch(() => {
                console.error("Error loading image")
            })
    }
}

export function getMemoryCanvasImage(element: CanvasImage): ICanvasImageMemory {
    let temp = getMemorySprite(element as any)
    return {
        ...temp,
        className: "CanvasImage",
        textureImage: { image: element.imageLink },
    }
}

export function setMemoryCanvasImage(element: CanvasImage, memory: ICanvasImageMemory) {
    setMemorySprite(element, memory)
}
