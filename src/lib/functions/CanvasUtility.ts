import { DisplayObject, Texture } from "pixi.js";
import { CanvasBase } from "../classes/canvas/CanvasBase";
import { CanvasContainer } from "../classes/canvas/CanvasContainer";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";
import { ITextureMemory } from "../interface/canvas/ITextureMemory";

/**
 * Get the memory object of the PixiJS texture
 * @param texture PixiJS Texture object
 * @returns Memory object of the texture
 */
export function getTextureMemory(texture: Texture): ITextureMemory {
    let baseTexture = texture.baseTexture
    let textureMemory: ITextureMemory = {
        image: (baseTexture.resource as any).url
    }
    return textureMemory
}

/**
 * Get the PixiJS texture from the memory object
 * @param textureMemory Memory object of the texture
 * @returns PixiJS Texture object
 */
export function getTexture(textureMemory: ITextureMemory): Texture {
    let texture = Texture.from(textureMemory.image)
    return texture
}

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvas<T1 extends DisplayObject, T2 extends ICanvasBaseMemory>(
    element: CanvasBase<T1, T2>,
): T2 {
    let temp = element.memory
    if (!(element instanceof CanvasContainer)) {
        return temp
    }
    element.listChildren.forEach(child => {
        temp.elements.push(exportCanvas(child))
    })
    return temp
}
