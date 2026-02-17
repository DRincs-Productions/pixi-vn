import { ContainerOptions, Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import { canvas } from "..";
import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { setListenerMemory } from "../components/ListenerExtension";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

const registeredCanvasComponent = new CachedMap<CanvasElementAliasType, typeof CanvasBaseItem<any>>({ cacheSize: 5 });
const registeredCanvasInstanceGetters = new CachedMap<
    CanvasElementAliasType,
    (
        canvasClass: typeof CanvasBaseItem<CanvasBaseItemMemory>,
        memory: CanvasBaseItemMemory,
    ) => CanvasBaseItem<CanvasBaseItemMemory> | Promise<CanvasBaseItem<CanvasBaseItemMemory>>
>({ cacheSize: 2 });
const registeredCanvasComponentCopyProperties = new CachedMap<
    CanvasElementAliasType,
    (component: CanvasBaseItem<CanvasBaseItemMemory>, source: CanvasBaseItemMemory) => void | Promise<void>
>({ cacheSize: 2 });
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
         * This function is used into {@link canvas.restore} to restore the canvas.
         * @param canvasClass The class of the canvas component.
         * @param memory Memory of the canvas component.
         * @returns The instance of the canvas component.
         */
        getInstance?: (canvasClass: T, memory: M) => CanvasBaseItem<M> | Promise<CanvasBaseItem<M>>;
        /**
         * Function to copy the properties of the canvas component. This function is used when to copy the properties of the canvas component into another instance of the same canvas component.
         * This function is used into {@link canvas.copyCanvasElementProperty} to copy the properties of the canvas component.
         * @param component The instance of the canvas component to copy the properties.
         * @param memory The memory of the canvas component to copy the properties.
         * @returns
         */
        copyProperty?: (component: CanvasBaseItem<M>, memory: M) => void | Promise<void>;
    } = {},
) {
    return function (target: T) {
        RegisteredCanvasComponents.add(target, options);
    };
}

export async function setMemoryContainer<T extends PixiContainer>(
    element: T | PixiContainer,
    memory: ContainerOptions | {},
    options?: {
        ignoreScale?: boolean;
        end?: () => Promise<void> | void;
    },
) {
    let ignoreScale = options?.ignoreScale || false;
    let end = options?.end;
    "isRenderGroup" in memory && memory.isRenderGroup !== undefined && (element.isRenderGroup = memory.isRenderGroup);
    "blendMode" in memory && memory.blendMode !== undefined && (element.blendMode = memory.blendMode);
    "tint" in memory && memory.tint !== undefined && (element.tint = memory.tint);
    "alpha" in memory && memory.alpha !== undefined && (element.alpha = memory.alpha);
    "angle" in memory && memory.angle !== undefined && (element.angle = memory.angle);
    "renderable" in memory && memory.renderable !== undefined && (element.renderable = memory.renderable);
    "rotation" in memory && memory.rotation !== undefined && (element.rotation = memory.rotation);
    if (!ignoreScale && "scale" in memory && memory.scale !== undefined) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale);
        } else {
            element.scale.set(memory.scale.x, memory.scale.y);
        }
    }
    if ("pivot" in memory && memory.pivot !== undefined) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot);
        } else {
            element.pivot.set(memory.pivot.x, memory.pivot.y);
        }
    }
    "position" in memory && memory.position !== undefined && element.position.set(memory.position.x, memory.position.y);
    "skew" in memory && memory.skew !== undefined && element.skew.set(memory.skew.x, memory.skew.y);
    "visible" in memory && memory.visible !== undefined && (element.visible = memory.visible);
    "x" in memory && memory.x !== undefined && (element.x = memory.x);
    "y" in memory && memory.y !== undefined && (element.y = memory.y);
    "boundsArea" in memory && memory.boundsArea !== undefined && (element.boundsArea = memory.boundsArea);

    "cursor" in memory && memory.cursor !== undefined && (element.cursor = memory.cursor);
    "eventMode" in memory && memory.eventMode !== undefined && (element.eventMode = memory.eventMode);
    "interactive" in memory && memory.interactive !== undefined && (element.interactive = memory.interactive);
    "interactiveChildren" in memory &&
        memory.interactiveChildren !== undefined &&
        (element.interactiveChildren = memory.interactiveChildren);
    "hitArea" in memory && memory.hitArea !== undefined && (element.hitArea = memory.hitArea);
    setListenerMemory(element, memory);

    // end
    if (end) {
        await end();
    }
    // width and height must be set after the scale
    if (!ignoreScale) {
        "width" in memory && memory.width !== undefined && (element.width = memory.width);
        "height" in memory && memory.height !== undefined && (element.height = memory.height);
    }
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
             * This function is used into {@link canvas.restore} to restore the canvas.
             * @param canvasClass The class of the canvas component.
             * @param memory Memory of the canvas component.
             * @returns The instance of the canvas component.
             */
            getInstance?: (canvasClass: T, memory: M) => CanvasBaseItem<M> | Promise<CanvasBaseItem<M>>;
            /**
             * Function to copy the properties of the canvas component. This function is used when to copy the properties of the canvas component into another instance of the same canvas component.
             * This function is used into {@link canvas.copyCanvasElementProperty} to copy the properties of the canvas component.
             * @param component The instance of the canvas component to copy the properties.
             * @param memory The memory of the canvas component to copy the properties.
             * @returns
             */
            copyProperty?: (component: CanvasBaseItem<M>, memory: M) => void | Promise<void>;
        } = {},
    ) {
        const {
            name = target.name,
            getInstance = async (canvasClass: T, memory: M) => {
                const instance = new canvasClass();
                await instance.setMemory(memory);
                return instance;
            },
            copyProperty = async (component: CanvasBaseItem<M>, memory: M) => {
                await component.setMemory(memory);
            },
        } = options;
        if (registeredCanvasComponent.get(name)) {
            logger.warn(`CanvasElement "${name}" already registered`);
        }
        target.prototype.pixivnId = name;
        registeredCanvasComponent.set(name, target);
        registeredCanvasInstanceGetters.set(name, getInstance as any);
        registeredCanvasComponentCopyProperties.set(name, copyProperty as any);
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

    export async function copyProperty<M extends CanvasBaseItemMemory>(
        canvasId: CanvasElementAliasType,
        component: CanvasBaseItem<M>,
        source: CanvasBaseItemMemory,
    ) {
        const copyProperty = registeredCanvasComponentCopyProperties.get(canvasId);
        if (!copyProperty) {
            logger.error(
                `CanvasElement "${canvasId}" not found, did you forget to register it with the canvasComponentDecorator?`,
            );
            return;
        }
        try {
            await copyProperty(component, source);
        } catch (e) {
            logger.error(`Error while copying properties of CanvasElement "${canvasId}"`, e);
        }
        return;
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
