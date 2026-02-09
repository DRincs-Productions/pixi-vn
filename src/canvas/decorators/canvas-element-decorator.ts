import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

const registeredCanvasComponent = new CachedMap<CanvasElementAliasType, typeof CanvasBaseItem<any>>({ cacheSize: 5 });
const registeredCanvasInstanceGetters = new CachedMap<
    CanvasElementAliasType,
    (
        canvasClass: typeof CanvasBaseItem<CanvasBaseItemMemory>,
        memory: CanvasBaseItemMemory,
    ) => CanvasBaseItem<CanvasBaseItemMemory> | Promise<CanvasBaseItem<CanvasBaseItemMemory>>
>({ cacheSize: 5 });
/**
 * Is a decorator that register a canvas component in the game.
 * @param options Options for the canvas component.
 * @returns
 */
export function canvasComponentDecorator<M extends CanvasBaseItemMemory, T extends typeof CanvasBaseItem<M>>(
    options: {
        /**
         * Name of the canvas component. If the name is already registered, it will show a warning
         * @default target.name
         */
        name?: CanvasElementAliasType;
        /**
         * Function to get the instance of the canvas component. If not set, it will use the default constructor of the class.
         * @param canvasClass The class of the canvas component.
         * @param memory Memory of the canvas component.
         * @returns The instance of the canvas component.
         */
        getInstance?: (canvasClass: T, memory: M) => CanvasBaseItem<M> | Promise<CanvasBaseItem<M>>;
    } = {},
) {
    return function (target: T) {
        RegisteredCanvasComponents.add(target, options);
    };
}

namespace RegisteredCanvasComponents {
    /**
     * Register a canvas component in the game.
     * @param target The class of the canvas component.
     * @param options Options for the canvas component.
     */
    export function add<M extends CanvasBaseItemMemory, T extends typeof CanvasBaseItem<M>>(
        target: T,
        options: {
            /**
             * Name of the canvas component. If the name is already registered, it will show a warning
             * @default target.name
             */
            name?: CanvasElementAliasType;
            /**
             * Function to get the instance of the canvas component. If not set, it will use the default constructor of the class.
             * @param canvasClass The class of the canvas component.
             * @param memory Memory of the canvas component.
             * @returns The instance of the canvas component.
             */
            getInstance?: (canvasClass: T, memory: M) => CanvasBaseItem<M> | Promise<CanvasBaseItem<M>>;
        } = {},
    ) {
        const {
            name = target.name,
            getInstance = (cc: T, memory: M) => {
                const instance = new cc();
                instance.memory = memory;
                return instance;
            },
        } = options;
        if (registeredCanvasComponent.get(name)) {
            logger.warn(`CanvasElement "${name}" already registered`);
        }
        target.prototype.pixivnId = name;
        registeredCanvasComponent.set(name, target);
        registeredCanvasInstanceGetters.set(name, getInstance as any);
    }

    /**
     * Get a canvas component by the id.
     * @param canvasId The id of the canvas component.
     * @returns The canvas component type.
     */
    export function get<T extends typeof CanvasBaseItem<any>>(canvasId: CanvasElementAliasType): T | undefined {
        let eventType = registeredCanvasComponent.get(canvasId);
        if (!eventType) {
            logger.error(
                `CanvasElement "${canvasId}" not found, did you forget to register it with the canvasComponentDecorator?`,
            );
            return;
        }
        return eventType as T;
    }

    export async function getInstance<M extends CanvasBaseItemMemory, T extends CanvasBaseItem<M>>(
        canvasId: CanvasElementAliasType,
        memory: M,
    ): Promise<T | undefined> {
        const eventType = get(canvasId);
        const getInstance = registeredCanvasInstanceGetters.get(canvasId);
        if (!eventType || !getInstance) {
            logger.error(
                `CanvasElement "${canvasId}" not found, did you forget to register it with the canvasComponentDecorator?`,
            );
            return;
        }
        try {
            let canvasElement = await getInstance(eventType, memory);
            return canvasElement as T;
        } catch (e) {
            logger.error(`Error while getting CanvasElement instance "${canvasId}"`, e);
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
