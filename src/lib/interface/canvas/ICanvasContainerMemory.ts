import { ICanvasContainer } from "../../classes/canvas/CanvasContainer";
import { ExportedPixiElementType } from "../../pixiElement/ExportedType";

export interface ICanvasContainerMemory extends ICanvasContainer {
    elements: ExportedPixiElementType[]
}