import CanvasBaseItem from "../classes/canvas/CanvasBaseItem";
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
