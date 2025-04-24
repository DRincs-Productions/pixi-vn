import { logger } from "../../utils/log-utility";
import { CanvasBaseInterface } from "../classes/CanvasBaseItem";
import { default as RegisteredCanvasComponent } from "../decorators/canvas-element-decorator";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<T extends CanvasBaseInterface<any>>(
    memory: CanvasBaseItemMemory
): Promise<T> {
    let element = getCanvasElementInstanceById<T>(memory.pixivnId);
    if (element) {
        await element.setMemory(memory);
    } else {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created");
    }

    return element;
}

export function getCanvasElementInstanceById<T extends CanvasBaseInterface<any>>(
    canvasId: CanvasElementAliasType
): T | undefined {
    try {
        let eventType = RegisteredCanvasComponent.get(canvasId);
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
