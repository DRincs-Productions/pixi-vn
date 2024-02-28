import { ICanvasContainer } from "../../classes/canvas/CanvasContainer";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";
export interface ICanvasContainerMemory extends ICanvasContainer {
    className: string,
    elements: ICanvasBaseMemory[]
}