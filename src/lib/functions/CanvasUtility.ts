import { Container, Texture } from "pixi.js";
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

export function getMemoryContainer<T extends Container>(element: T): ICanvasBaseMemory {
    return {
        className: "Container",
        elements: [],

        width: element.width,
        height: element.height,

        isRenderGroup: element.isRenderGroup,
        blendMode: element.blendMode,
        tint: element.tint,
        alpha: element.alpha,
        angle: element.angle,
        renderable: element.renderable,
        rotation: element.rotation,
        scale: { x: element.scale.x, y: element.scale.y },
        pivot: { x: element.pivot.x, y: element.pivot.y },
        position: { x: element.position.x, y: element.position.y },
        skew: { x: element.skew.x, y: element.skew.y },
        visible: element.visible,
        culled: element.culled,
        x: element.x,
        y: element.y,
        boundsArea: element.boundsArea,
    }
}

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T1 extends Container, T2 extends ICanvasBaseMemory>(
    element: T1,
): T2 | ICanvasBaseMemory {
    let temp: T2 | ICanvasBaseMemory
    if (element instanceof Container) {
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
export function importCanvasElement<T1 extends Container, T2 extends ICanvasBaseMemory>(
    memory: T2 | ICanvasBaseMemory,
): T1 | Container {
    let element: T1 | Container
    if (memory.className === "Container") {
        element = new Container(memory)
    }
    else {
        throw new Error("Invalid class name")
    }

    memory.elements.forEach(child => {
        element.addChild(importCanvasElement(child))
    })
    return element
}
