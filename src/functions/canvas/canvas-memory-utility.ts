import { CanvasBase } from "../../classes";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { CanvasItemBaseMemory } from "../../interface";

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends CanvasBase<any>>(
    element: T,
): CanvasItemBaseMemory {
    return element.memory
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export function importCanvasElement<T extends CanvasBase<any>>(
    memory: CanvasItemBaseMemory,
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
