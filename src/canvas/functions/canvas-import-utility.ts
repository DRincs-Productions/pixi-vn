import CanvasBaseItem from "../classes/CanvasBaseItem";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<M extends CanvasBaseItemMemory, T extends CanvasBaseItem<M>>(
    memory: M,
): Promise<T> {
    let element = await RegisteredCanvasComponents.getInstance<M, T>(memory.pixivnId, memory);
    if (!element) {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created");
    }

    return element;
}
