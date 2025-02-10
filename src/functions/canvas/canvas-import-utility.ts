import { CanvasBaseItem, Container, ImageContainer, ImageSprite, Sprite, Text, VideoSprite } from "../../classes";
import {
    CANVAS_CONTAINER_ID,
    CANVAS_IMAGE_CONTAINER_ID,
    CANVAS_IMAGE_ID,
    CANVAS_SPRITE_ID,
    CANVAS_TEXT_ID,
    CANVAS_VIDEO_ID,
} from "../../constants";
import { getCanvasElementTypeById } from "../../decorators/canvas-element-decorator";
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
            switch (canvasId) {
                case CANVAS_CONTAINER_ID:
                    eventType = Container;
                    break;
                case CANVAS_VIDEO_ID:
                    eventType = VideoSprite;
                    break;
                case CANVAS_IMAGE_ID:
                    eventType = ImageSprite;
                    break;
                case CANVAS_SPRITE_ID:
                    eventType = Sprite;
                    break;
                case CANVAS_TEXT_ID:
                    eventType = Text;
                    break;
                case CANVAS_IMAGE_CONTAINER_ID:
                    eventType = ImageContainer;
                    break;
            }
        }

        if (!eventType) {
            console.error(`CanvasElement ${canvasId} not found`);
            return;
        }
        let canvasElement = new eventType();
        return canvasElement as T;
    } catch (e) {
        console.error(`Error while getting CanvasElement ${canvasId}`, e);
        return;
    }
}
