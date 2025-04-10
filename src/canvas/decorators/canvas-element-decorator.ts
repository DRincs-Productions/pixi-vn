import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

const registeredCanvasElement = new Map<CanvasElementAliasType, typeof CanvasBaseItem<any>>();
/**
 * Is a decorator that register a canvas element in the game.
 * @param name Name of the canvas element, by default it will use the class name. If the name is already registered, it will show a warning
 * @returns
 */
export default function canvasComponentDecorator(name?: CanvasElementAliasType) {
    return function (target: typeof CanvasBaseItem<any>) {
        canvasComponentDecoratorFn(target, name);
    };
}

export function canvasComponentDecoratorFn(target: typeof CanvasBaseItem<any>, name?: CanvasElementAliasType) {
    if (!name) {
        name = target.name;
    }
    if (registeredCanvasElement.get(name)) {
        logger.warn(`CanvasElement ${name} already registered`);
    }
    target.prototype.pixivnId = name;
    registeredCanvasElement.set(name, target);
}

export function getCanvasElementTypeById<T extends typeof CanvasBaseItem<any>>(
    canvasId: CanvasElementAliasType
): T | undefined {
    try {
        let eventType = registeredCanvasElement.get(canvasId);
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
