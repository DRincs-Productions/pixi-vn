import { ContainerST, IContainerMemory } from "./ContainerST";
import { ISpriteMemory } from "./SpriteST";
import { DisplayObjectStored } from "./StoredGraficElement";
import { ITextMemory } from "./TextST";

export type ExportedPixiElementType = IContainerMemory | ISpriteMemory | ITextMemory

export function exampleFunction(
    temp: ExportedPixiElementType,
    element: DisplayObjectStored<any, any>,
): ExportedPixiElementType {
    if (!element.hasOwnProperty("listChildren")) {
        return temp
    }
    (element as ContainerST).listChildren.forEach(child => {
        let timpItem = child.memory
        temp.elements.push(exampleFunction(timpItem, child))
    })
    return temp
}