import { Texture } from "pixi.js";
import { getCanvasElementInstanceByClassName } from "../decorators/CanvasElementDecorator";
import { ICanvasBase } from "../interface/ICanvasBase";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";
import { ITextureMemory } from "../interface/canvas/ITextureMemory";

/**
 * Get the memory object of the PixiJS texture
 * @param texture PixiJS Texture object
 * @returns Memory object of the texture
 */
export function getTextureMemory(texture: Texture): ITextureMemory {
    let sourceTexture = texture.source
    let textureMemory: ITextureMemory = {
        image: sourceTexture.label
    }
    return textureMemory
}

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends ICanvasBase<any>>(
    element: T,
): ICanvasBaseMemory {
    return element.memory
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export function importCanvasElement<T extends ICanvasBase<any>>(
    memory: ICanvasBaseMemory,
): T {
    let element = getCanvasElementInstanceByClassName<T>(memory.className)
    if (element) {
        element.memory = memory
    }
    else {
        throw new Error("Invalid class name")
    }

    return element
}
