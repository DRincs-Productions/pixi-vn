import { DisplayObjectStored } from "../classes/canvas/DisplayObjectStored";
import { CanvasContainer, ICanvasContainerMemory } from "./ContainerST";
import { ICanvasSpriteMemory } from "./SpriteST";
import { ITextMemory } from "./TextST";

export type ExportedPixiElementType = ICanvasContainerMemory | ICanvasSpriteMemory | ITextMemory

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