import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";
import CanvasEvent from "../classes/CanvasEvent";
import { CanvasBaseInterface } from "../interfaces/CanvasBaseInterface";
import CanvasEventNamesType from "../types/CanvasEventNamesType";
import { EventIdType } from "../types/EventIdType";

/**
 * Canvas Event Register
 */
const registeredEvents = new CachedMap<EventIdType, typeof CanvasEvent<CanvasEventNamesType>>({ cacheSize: 5 });
/**
 * Is a decorator that register a event in the game.
 * Is a required decorator for use the event in the game.
 * Thanks to this decoration the game has the possibility of updating the events to the latest modification and saving the game.
 * @param name is th identifier of the event, by default is the name of the class
 * @returns
 */
export function eventDecorator(name?: EventIdType) {
    return function (target: typeof CanvasEvent<any>) {
        RegisteredEvents.add(target, name);
    };
}

namespace RegisteredEvents {
    /**
     * Register a event in the game.
     * @param target The class of the event.
     * @param name Name of the event, by default it will use the class name. If the name is already registered, it will show a warning
     */
    export function add(target: typeof CanvasEvent<CanvasEventNamesType>, name?: EventIdType) {
        if (!name) {
            name = target.name;
        }
        if (registeredEvents.get(name)) {
            logger.info(`Event "${name}" already exists, it will be overwritten`);
        }
        target.prototype.id = name;
        registeredEvents.set(name, target);
    }

    /**
     * Get a event by the id.
     * @param canvasId The id of the event.
     * @returns The event type.
     */
    export function get<T = typeof CanvasEvent<CanvasBaseInterface<any>>>(eventId: EventIdType): T | undefined {
        try {
            let eventType = registeredEvents.get(eventId);
            if (!eventType) {
                logger.error(`Event "${eventId}" not found, did you forget to register it with the eventDecorator?`);
                return;
            }
            new eventType();
            return eventType as T;
        } catch (e) {
            logger.error(`Error while getting Event "${eventId}"`, e);
            return;
        }
    }

    /**
     * Get a event instance by the id.
     * @param eventId The id of the event.
     * @returns The event instance.
     */
    export function getInstance<T = CanvasEvent<CanvasBaseInterface<any>>>(eventId: EventIdType): T | undefined {
        try {
            let eventType = registeredEvents.get(eventId);
            if (!eventType) {
                logger.error(`Event "${eventId}" not found, did you forget to register it with the eventDecorator?`);
                return;
            }
            let event = new eventType();
            return event as T;
        } catch (e) {
            logger.error(`Error while getting Event "${eventId}"`, e);
            return;
        }
    }

    /**
     * Get a list of all events registered.
     * @returns An array of events.
     */
    export function values(): (typeof CanvasEvent<CanvasEventNamesType>)[] {
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
}
export default RegisteredEvents;
