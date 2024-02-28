import { DisplayObject, Texture } from "pixi.js";
import { CanvasBase } from "../classes/canvas/CanvasBase";
import { CanvasContainerBase } from "../classes/canvas/CanvasContainer";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";
import { ITextureMemory } from "../interface/canvas/ITextureMemory";

export function getTextureMemory(texture: Texture): ITextureMemory {
    let baseTexture = texture.baseTexture
    let textureMemory: ITextureMemory = {
        image: (baseTexture.resource as any).url
    }
    return textureMemory
}

export function getTexture(textureMemory: ITextureMemory) {
    let texture = Texture.from(textureMemory.image)
    return texture
}

export function exportCanvas<T1 extends DisplayObject, T2 extends ICanvasBaseMemory>(
    element: CanvasBase<T1, T2>,
): T2 {
    let temp = element.memory
    if (!element.hasOwnProperty("listChildren")) {
        return temp
    }
    (element as CanvasContainerBase<any, any>).listChildren.forEach(child => {
        temp.elements.push(exportCanvas(child))
    })
    return temp
}
