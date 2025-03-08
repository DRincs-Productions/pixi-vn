import { CanvasBaseItem } from "../../classes";
import { getCanvasElementTypeById } from "../../decorators/canvas-element-decorator";
import { logger } from "../../functions/log-utility";
import { CanvasBaseItemMemory } from "../../interface";
import { CanvasElementAliasType } from "../../types/CanvasElementAliasType";

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<T extends CanvasBaseItem<any>>(memory: CanvasBaseItemMemory): Promise<T> {
    let element = getCanvasElementInstanceById<T>(memory.pixivnId);
    if (element) {
        await element.setMemory(memory);
    } else {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created");
    }

    return element;
}

export function getCanvasElementInstanceById<T extends CanvasBaseItem<any>>(
    canvasId: CanvasElementAliasType
): T | undefined {
    try {
        let eventType = getCanvasElementTypeById(canvasId);
        if (!eventType) {
            return;
        }
        let canvasElement = new eventType();
        return canvasElement as T;
    } catch (e) {
        logger.error(`Error while getting CanvasElement ${canvasId}`, e);
        return;
    }
}
