import { Container, ImageContainer, ImageSprite, Sprite, Text, VideoSprite } from "../classes";
import CanvasBaseItem from "../classes/canvas/CanvasBaseItem";
import {
    CANVAS_CONTAINER_ID,
    CANVAS_IMAGE_CONTAINER_ID,
    CANVAS_IMAGE_ID,
    CANVAS_SPRITE_ID,
    CANVAS_TEXT_ID,
    CANVAS_VIDEO_ID,
} from "../constants";
import { logger } from "../functions/log-utility";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

const registeredCanvasElement: { [name: CanvasElementAliasType]: typeof CanvasBaseItem<any> } = {};
/**
 * Is a decorator that register a canvas element in the game.
 * @param name Name of the canvas element, by default it will use the class name. If the name is already registered, it will show a warning
 * @returns
 */
export default function canvasComponentDecorator(name?: CanvasElementAliasType) {
    return function (target: typeof CanvasBaseItem<any>) {
        if (!name) {
            name = target.name;
        }
        if (registeredCanvasElement[name]) {
            logger.warn(`CanvasElement ${name} already registered`);
        }
        target.prototype.pixivnId = name;
        registeredCanvasElement[name] = target;
    };
}

export function getCanvasElementTypeById<T extends typeof CanvasBaseItem<any>>(
    canvasId: CanvasElementAliasType
): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasId];
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
            logger.error(
                `CanvasElement ${canvasId} not found, did you forget to register it with the canvasComponentDecorator?`
            );
            return;
        }
        new eventType();
        return eventType as T;
    } catch (e) {
        logger.error(`Error while getting CanvasElement ${canvasId}`, e);
        return;
    }
}
