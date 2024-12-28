import { Container as PixiContainer, Sprite as PixiSprite, Text as PixiText } from "pixi.js";
import { CanvasBaseItem } from "../../classes";
import { CANVAS_CONTAINER_ID, CANVAS_SPRITE_ID, CANVAS_TEXT_ID } from "../../constants";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { CanvasBaseItemMemory, ContainerMemory, SpriteMemory, TextMemory } from "../../interface";
import { getTextStyle } from "../texture-utility";
import { getTextureMemory } from "./canvas-utility";

/**
 * Export a Canvas element to a memory object
 * @param canvasComponent Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends PixiContainer>(
    canvasComponent: T,
): CanvasBaseItemMemory {
    if (
        "memory" in canvasComponent
    ) {
        return canvasComponent.memory as CanvasBaseItemMemory
    }
    else if (canvasComponent instanceof PixiText) {
        return getMemoryText(canvasComponent)
    }
    else if (canvasComponent instanceof PixiSprite) {
        return getMemorySprite(canvasComponent)
    }
    else {
        return getMemoryContainer(canvasComponent)
    }
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<T extends CanvasBaseItem<any>>(
    memory: CanvasBaseItemMemory,
): Promise<T> {
    let element = getCanvasElementInstanceById<T>(memory.pixivnId)
    if (element) {
        await element.setMemory(memory)
    }
    else {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created")
    }

    return element
}

export function getMemoryContainer<T extends PixiContainer>(element: T, options?: {
    childrenExport?: boolean
}): ContainerMemory {
    let className = CANVAS_CONTAINER_ID
    let childrenExport = options?.childrenExport || false
    if (element.hasOwnProperty("pixivnId")) {
        className = (element as any).pixivnId
    }
    let elements: CanvasBaseItemMemory[] = []
    if (childrenExport) {
        element.children
            .sort((a, b) => element.getChildIndex(a) - element.getChildIndex(b))
            .forEach(child => {
                elements.push(exportCanvasElement(child as CanvasBaseItem<any>))
            })
    }
    return {
        pixivnId: className,
        elements: elements,

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
        x: element.x,
        y: element.y,
        boundsArea: element.boundsArea,

        cursor: element.cursor,
        eventMode: element.eventMode,
        interactive: element.interactive,
        interactiveChildren: element.interactiveChildren,
        hitArea: element.hitArea
    }
}

export function getMemorySprite<T extends PixiSprite>(element: T | PixiSprite): SpriteMemory {
    let temp = getMemoryContainer(element)
    let className = temp.pixivnId ?? CANVAS_SPRITE_ID
    let onEvents = {}
    if ("onEvents" in element) {
        onEvents = element.onEvents as any
    }
    let textureData
    if ("textureAlias" in element) {
        textureData = getTextureMemory(element.texture, element.textureAlias as string)
    }
    else {
        textureData = getTextureMemory(element.texture)
    }
    return {
        ...temp,
        pixivnId: className,
        textureData: textureData,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        roundPixels: element.roundPixels,
        onEvents: onEvents,
    }
}

export function getMemoryText<T extends PixiText>(element: T | PixiText): TextMemory {
    let temp = getMemoryContainer(element)
    let className = temp.pixivnId ?? CANVAS_TEXT_ID
    let onEvents = {}
    if ("onEvents" in element) {
        onEvents = element.onEvents as any
    }
    return {
        ...temp,
        pixivnId: className,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        text: element.text,
        resolution: element.resolution,
        style: getTextStyle(element.style),
        roundPixels: element.roundPixels,
        onEvents: onEvents,
    }
}
