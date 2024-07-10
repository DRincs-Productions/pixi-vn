import { CanvasEvent } from "../classes"
import CanvasBase from "../classes/canvas/CanvasBase"
import { CanvasEventNamesType } from "../types/CanvasEventNamesType"
import { EventIdType } from "../types/EventIdType"

/**
 * Canvas Event Register
 */
export const registeredEvents: { [name: EventIdType]: typeof CanvasEvent<CanvasEventNamesType> } = {}
/**
 * Is a decorator that register a event in the game.
 * Is a required decorator for use the event in the game.
 * Thanks to this decoration the game has the possibility of updating the events to the latest modification and saving the game.
 * @param name is th identifier of the event, by default is the name of the class
 * @returns 
 */
export default function eventDecorator(name?: EventIdType) {
    return function (target: typeof CanvasEvent<any>) {
        if (!name) {
            name = target.name
        }
        if (registeredEvents[name]) {
            console.info(`[Pixi'VN] Event ${name} already exists, it will be overwritten`)
        }
        registeredEvents[name] = target
    }
}

/**
 * Get an event type by the class name.
 * @param eventName The name of the class.
 * @returns The event type.
 */
export function getEventTypeByClassName<T = typeof CanvasEvent<CanvasBase<any>>>(eventName: EventIdType): T | undefined {
    try {
        let eventType = registeredEvents[eventName]
        if (!eventType) {
            console.error(`[Pixi'VN] Event ${eventName} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting Event ${eventName}`, e)
        return
    }
}

/**
 * Get an event instance by the class name.
 * @param eventName The name of the class.
 * @returns The event instance.
 */
export function getEventInstanceByClassName<T = CanvasEvent<CanvasBase<any>>>(eventName: EventIdType): T | undefined {
    try {
        let eventType = registeredEvents[eventName]
        if (!eventType) {
            console.error(`[Pixi'VN] Event ${eventName} not found`)
            return
        }
        let event = new eventType()
        return event as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting Event ${eventName}`, e)
        return
    }
}
