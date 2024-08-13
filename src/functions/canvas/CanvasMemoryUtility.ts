import { CanvasBase } from "../../classes/canvas";
import { getCanvasElementInstanceById } from "../../decorators/CanvasElementDecorator";
import { ICanvasBaseMemory } from "../../interface/canvas";

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends CanvasBase<any>>(
    element: T,
): ICanvasBaseMemory {
    return element.memory
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export function importCanvasElement<T extends CanvasBase<any>>(
    memory: ICanvasBaseMemory,
): T {
    let element = getCanvasElementInstanceById<T>(memory.pixivnId)
    if (element) {
        element.memory = memory
    }
    else {
        throw new Error("[Pixi'VN] The element " + memory.pixivnId + " could not be created")
    }

    return element
}
