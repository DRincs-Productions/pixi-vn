import { ICanvasContainerMemory } from "./ICanvasContainerMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export interface ICanvasImageMemory extends ICanvasContainerMemory {
    imageLink: string
}
