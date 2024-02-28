import { ICanvasContainer } from "../../classes/canvas/CanvasContainer";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";

/**
 * Interface for the canvas container memory
 */
export interface ICanvasContainerMemory extends ICanvasContainer {
    className: string,
    elements: ICanvasBaseMemory[]
}