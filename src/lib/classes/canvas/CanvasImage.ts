import { Sprite, Texture, TextureSourceLike } from "pixi.js";
import { canvasElementDecorator } from "../../decorators/CanvasElementDecorator";
import { getTexture } from "../../functions/TextureUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { CanvasSprite, getMemorySprite, setMemorySprite } from "./CanvasSprite";

/**
 * The class for the image.
 * Must use refreshImage() to load the image.
 */
@canvasElementDecorator()
export class CanvasImage extends CanvasSprite<ICanvasImageMemory> {
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
    async load() {
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
