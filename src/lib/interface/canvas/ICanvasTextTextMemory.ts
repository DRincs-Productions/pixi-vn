import { ICanvasText } from "../../classes/canvas/CanvasText";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";

export interface ICanvasTextMemory extends ICanvasText {
    className: string,
    elements: ICanvasBaseMemory[],
}