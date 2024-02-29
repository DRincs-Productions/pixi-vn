import { ICanvasContainerMemory } from "./ICanvasContainerMemory";

/**
 * Interface for the canvas text memory
 */
export interface ICanvasTextMemory extends ICanvasContainerMemory {
    anchor: { x: number, y: number },
}