import { CanvasBaseItem } from "../../classes";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { CanvasBaseItemMemory } from "../../interface";

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
