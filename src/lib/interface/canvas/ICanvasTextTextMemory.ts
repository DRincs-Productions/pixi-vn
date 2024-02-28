import { ICanvasText } from "../../classes/canvas/CanvasText";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";

/**
 * Interface for the canvas text memory
 */
export interface ICanvasTextMemory extends ICanvasText {
    className: string,
    elements: ICanvasBaseMemory[],
}