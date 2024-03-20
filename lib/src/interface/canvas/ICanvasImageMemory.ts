import { ICanvasSpriteBaseMemory } from "./ICanvasSpriteMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export default interface ICanvasImageMemory extends ICanvasSpriteBaseMemory {
    className: "CanvasImage",
}
