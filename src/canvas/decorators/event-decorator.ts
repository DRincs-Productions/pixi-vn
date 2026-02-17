import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";

export const SERIALIZABLE_EVENT = Symbol("SerializableEvent");

/**
 * Canvas Event Register
 */
const registeredEvents = new CachedMap<string, Function>({ cacheSize: 5 });
/**
 * Is a decorator that register a event in the game.
 * Is a required decorator for use the event in the game.
 * Thanks to this decoration the game has the possibility of updating the events to the latest modification and saving the game.
 * @example
 * ```ts
 * \@eventDecorator()
 * function eventExample(event: AllFederatedEventMap, component: Sprite) {
 *     // event code here
 * }
 *
 * sprite.on("pointerdown", eventExample);
 * ```
 * @param name is th identifier of the event, by default is the name of the class
 * @returns
 */
export function eventDecorator(name?: string) {
    return function (fn: Function) {
        RegisteredEvents.add(fn, name);
    };
}

namespace RegisteredEvents {
    /**
     * Register a event in the game.
     * @param fn The class of the event.
     * @param name Name of the event, by default it will use the class name. If the name is already registered, it will show a warning
     */
    export function add(fn: Function, name?: string) {
        if (!name) {
            name = fn.name;
        }
        (fn as any)[SERIALIZABLE_EVENT] = name;
        if (registeredEvents.get(name)) {
            logger.info(`Event "${name}" already exists, it will be overwritten`);
        }
        fn.prototype.id = name;
        registeredEvents.set(name, fn);
    }

    /**
     * Get a event by the id.
     * @param canvasId The id of the event.
     * @returns The event type.
     */
    export function get(name: string): Function | undefined {
        try {
            let eventType = registeredEvents.get(name);
            if (!eventType) {
                logger.error(`Event "${name}" not found, did you forget to register it with the eventDecorator?`);
                return;
            }
            return eventType;
        } catch (e) {
            logger.error(`Error while getting Event "${name}"`, e);
            return;
        }
    }

    /**
     * Get a list of all events registered.
     * @returns An array of events.
     */
    export function values(): Function[] {
        return Array.from(registeredEvents.values());
    }

    /**
     * Check if a event is registered.
     * @param id The id of the event.
     * @returns True if the event is registered, false otherwise
     */
    export function has(id: string): boolean {
        return registeredEvents.has(id);
    }

    /**
     * Get a list of all event ids registered.
     * @returns An array of label ids.
     */
    export function keys(): string[] {
        return Array.from(registeredEvents.keys());
    }
}
export default RegisteredEvents;
