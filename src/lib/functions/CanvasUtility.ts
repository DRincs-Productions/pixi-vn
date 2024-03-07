import { Container, Texture } from "pixi.js";
import { CanvasContainer, getMemoryContainer } from "../classes/canvas/CanvasContainer";
import { CanvasImage, CanvasImageAsync, getMemoryCanvasImage, getMemoryCanvasImageAsync } from "../classes/canvas/CanvasImage";
import { CanvasSprite, getMemorySprite } from "../classes/canvas/CanvasSprite";
import { ITextureMemory } from "../interface/canvas/ITextureMemory";
import { SupportedCanvasElement, SupportedCanvasElementMemory } from "../types/SupportedCanvasElement";

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
export function exportCanvasElement<T extends Container>(
    element: T,
): SupportedCanvasElementMemory {
    let temp: SupportedCanvasElementMemory
    if (element instanceof CanvasImage) {
        temp = getMemoryCanvasImage(element)
    }
    else if (element instanceof CanvasImageAsync) {
        temp = getMemoryCanvasImageAsync(element)
    }
    else if (element instanceof CanvasSprite) {
        temp = getMemorySprite(element)
    }
    else if (element instanceof Container) {
        temp = getMemoryContainer(element)
    }
    else {
        throw new Error("Invalid class name")
    }

    element.children.forEach(child => {
        temp.elements.push(exportCanvasElement(child))
    })
    return temp
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export function importCanvasElement(
    memory: SupportedCanvasElementMemory,
): SupportedCanvasElement {
    let element: SupportedCanvasElement
    if (memory.className === "CanvasImage") {
        element = new CanvasImage(memory.imageLink)
    }
    else if (memory.className === "CanvasImageAsync") {
        element = new CanvasImageAsync(memory.imageLink)
    }
    else if (memory.className === "CanvasSprite") {
        element = CanvasSprite.from(getTexture(memory.textureImage))
    }
    else if (memory.className === "CanvasContainer") {
        element = new CanvasContainer(memory)
    }
    else {
        throw new Error("Invalid class name")
    }

    memory.elements.forEach(child => {
        element.addCanvasChild(importCanvasElement(child))
    })
    return element
}
