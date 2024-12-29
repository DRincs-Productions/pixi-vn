import { CanvasBaseItem, Container, ImageContainer, ImageSprite, Sprite, Text, VideoSprite } from "../../classes";
import { CANVAS_CONTAINER_ID, CANVAS_IMAGE_CONTAINER_ID, CANVAS_IMAGE_ID, CANVAS_SPRITE_ID, CANVAS_TEXT_ID, CANVAS_VIDEO_ID } from "../../constants";
import { registeredCanvasElement } from "../../decorators/canvas-element-decorator";
import { CanvasBaseItemMemory } from "../../interface";
import { CanvasElementAliasType } from "../../types/CanvasElementAliasType";

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

export function getCanvasElementInstanceById<T extends CanvasBaseItem<any>>(canvasId: CanvasElementAliasType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasId]
        if (!eventType) {
            if (canvasId === CANVAS_CONTAINER_ID) {
                eventType = Container
            }
            else if (canvasId === CANVAS_VIDEO_ID) {
                eventType = VideoSprite
            }
            else if (canvasId === CANVAS_IMAGE_ID) {
                eventType = ImageSprite
            }
            else if (canvasId === CANVAS_SPRITE_ID) {
                eventType = Sprite
            }
            else if (canvasId === CANVAS_TEXT_ID) {
                eventType = Text
            }
            else if (canvasId === CANVAS_IMAGE_CONTAINER_ID) {
                eventType = ImageContainer
            }
        }

        if (!eventType) {
            console.error(`[Pixi’VN] CanvasElement ${canvasId} not found`)
            return
        }
        let canvasElement = new eventType()
        return canvasElement as T
    }
    catch (e) {
        console.error(`[Pixi’VN] Error while getting CanvasElement ${canvasId}`, e)
        return
    }
}
