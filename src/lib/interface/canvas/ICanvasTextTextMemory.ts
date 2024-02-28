import { ICanvasText } from "../../classes/canvas/CanvasText";
import { ExportedPixiElementType } from "../../pixiElement/ExportedType";

export interface ICanvasTextTextMemory extends ICanvasText {
    elements: ExportedPixiElementType[],
}