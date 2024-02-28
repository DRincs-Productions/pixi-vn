import { CanvasContainer, IContainerMemory } from "./ContainerST";
import { ISpriteMemory } from "./SpriteST";
import { DisplayObjectStored } from "./StoredGraficElement";
import { ITextMemory } from "./TextST";

export type ExportedPixiElementType = IContainerMemory | ISpriteMemory | ITextMemory

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