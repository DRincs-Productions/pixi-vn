import { CanvasContainer } from "../classes/canvas/CanvasContainer";
import { DisplayObjectStored } from "../classes/canvas/DisplayObjectStored";
import { ICanvasContainerMemory } from "../interface/canvas/ICanvasContainerMemory";
import { ICanvasTextTextMemory } from "../interface/canvas/ICanvasTextTextMemory";
import { ICanvasSpriteMemory } from "./SpriteST";

export type ExportedPixiElementType = ICanvasContainerMemory | ICanvasSpriteMemory | ICanvasTextTextMemory

export function exampleFunction(
    element: DisplayObjectStored<any, any>,
): ExportedPixiElementType {
    let temp = element.memory
    if (!element.hasOwnProperty("listChildren")) {
        return temp
    }
    (element as CanvasContainer).listChildren.forEach(child => {
        temp.elements.push(exampleFunction(child))
    })
    return temp
}