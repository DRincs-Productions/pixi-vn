import { ContainerOptions, Container as PixiContainer, PointData } from "pixi.js";
import { CanvasBaseItem, ImageContainer } from "../../classes";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { CanvasBaseItemMemory } from "../../interface";

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends CanvasBaseItem<any>>(
    element: T,
): CanvasBaseItemMemory {
    return element.memory
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export function importCanvasElement<T extends CanvasBaseItem<any>>(
    memory: CanvasBaseItemMemory,
): T {
    let element = getCanvasElementInstanceById<T>(memory.pixivnId)
    if (element) {
        element.memory = memory
    }
    else {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created")
    }

    return element
}

export function setMemoryContainer<T extends PixiContainer>(element: T | PixiContainer, memory: ContainerOptions | {}, opstions?: {
    ignoreScale?: boolean,
}) {
    let ignoreScale = opstions?.ignoreScale || false

    if (element instanceof ImageContainer) {
        "anchor" in memory && memory.anchor && (element.anchor = memory.anchor as number | PointData)
    }
    "isRenderGroup" in memory && memory.isRenderGroup && (element.isRenderGroup = memory.isRenderGroup)
    "blendMode" in memory && memory.blendMode && (element.blendMode = memory.blendMode)
    "tint" in memory && memory.tint && (element.tint = memory.tint)
    "alpha" in memory && memory.alpha && (element.alpha = memory.alpha)
    "angle" in memory && memory.angle && (element.angle = memory.angle)
    "renderable" in memory && memory.renderable && (element.renderable = memory.renderable)
    "rotation" in memory && memory.rotation && (element.rotation = memory.rotation)
    if (!ignoreScale && "scale" in memory && memory.scale) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale)
        }
        else {
            element.scale.set(memory.scale.x, memory.scale.y)
        }
    }
    if ("pivot" in memory && memory.pivot) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot)
        }
        else {
            element.pivot.set(memory.pivot.x, memory.pivot.y)
        }
    }
    "position" in memory && memory.position && (element.position.set(memory.position.x, memory.position.y))
    "skew" in memory && memory.skew && (element.skew.set(memory.skew.x, memory.skew.y))
    "visible" in memory && memory.visible && (element.visible = memory.visible)
    "x" in memory && memory.x && (element.x = memory.x)
    "y" in memory && memory.y && (element.y = memory.y)
    "boundsArea" in memory && memory.boundsArea && (element.boundsArea = memory.boundsArea)

    "cursor" in memory && memory.cursor && (element.cursor = memory.cursor)
    "eventMode" in memory && memory.eventMode && (element.eventMode = memory.eventMode)
    "interactive" in memory && memory.interactive && (element.interactive = memory.interactive)
    "interactiveChildren" in memory && memory.interactiveChildren && (element.interactiveChildren = memory.interactiveChildren)
    "hitArea" in memory && memory.hitArea && (element.hitArea = memory.hitArea)

    // end
    // width and height must be set after the scale
    if (!ignoreScale) {
        "width" in memory && memory.width && (element.width = memory.width)
        "height" in memory && memory.height && (element.height = memory.height)
    }
}
