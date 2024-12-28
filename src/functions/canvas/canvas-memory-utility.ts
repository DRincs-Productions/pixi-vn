import { Container as PixiContainer, Sprite as PixiSprite, Text as PixiText } from "pixi.js";
import { CanvasBaseItem } from "../../classes";
import { getMemoryContainer } from "../../classes/canvas/Container";
import { getMemorySprite } from "../../classes/canvas/Sprite";
import { getMemoryText } from "../../classes/canvas/Text";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { CanvasBaseItemMemory } from "../../interface";

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
