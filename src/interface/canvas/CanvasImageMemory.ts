import { CanvasSpriteBaseMemory } from "./CanvasSpriteMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export default interface CanvasImageMemory extends CanvasSpriteBaseMemory {
    imageLink: string,
}
