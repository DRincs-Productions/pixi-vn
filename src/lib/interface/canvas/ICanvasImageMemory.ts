import { ICanvasSpriteMemory } from "./ICanvasSpriteMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export interface ICanvasImageMemory extends ICanvasSpriteMemory {
    imageLink: string
}
