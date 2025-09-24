import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

const registeredCanvasComponent = new CachedMap<CanvasElementAliasType, typeof CanvasBaseItem<any>>({ cacheSize: 5 });
/**
 * Is a decorator that register a canvas component in the game.
 * @param name Name of the canvas component, by default it will use the class name. If the name is already registered, it will show a warning
 * @returns
 */
export function canvasComponentDecorator(name?: CanvasElementAliasType) {
    return function (target: typeof CanvasBaseItem<any>) {
        RegisteredCanvasComponents.add(target, name);
    };
}

namespace RegisteredCanvasComponents {
    /**
     * Register a canvas component in the game.
     * @param target The class of the canvas component.
     * @param name Name of the canvas component, by default it will use the class name. If the name is already registered, it will show a warning
     */
    export function add(target: typeof CanvasBaseItem<any>, name?: CanvasElementAliasType) {
        if (!name) {
            name = target.name;
        }
        if (registeredCanvasComponent.get(name)) {
            logger.warn(`CanvasElement "${name}" already registered`);
        }
        target.prototype.pixivnId = name;
        registeredCanvasComponent.set(name, target);
    }

    /**
     * Get a canvas component by the id.
     * @param canvasId The id of the canvas component.
     * @returns The canvas component type.
     */
    export function get<T extends typeof CanvasBaseItem<any>>(canvasId: CanvasElementAliasType): T | undefined {
        try {
            let eventType = registeredCanvasComponent.get(canvasId);
            if (!eventType) {
                logger.error(
                    `CanvasElement "${canvasId}" not found, did you forget to register it with the canvasComponentDecorator?`
                );
                return;
            }
            new eventType();
            return eventType as T;
        } catch (e) {
            logger.error(`Error while getting CanvasElement "${canvasId}"`, e);
            return;
        }
    }

    /**
     * Get a list of all canvas components registered.
     * @returns An array of canvas components.
     */
    export function values(): (typeof CanvasBaseItem<any>)[] {
        return Array.from(registeredCanvasComponent.values());
    }

    /**
     * Check if a canvas component is registered.
     * @param id The id of the canvas component.
     * @returns True if the canvas component is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredCanvasComponent.has(id);
    }

    /**
     * Get a list of all canvas component ids registered.
     * @returns An array of label ids.
     */
    export function keys(): string[] {
        return Array.from(registeredCanvasComponent.keys());
    }
}
export default RegisteredCanvasComponents;
