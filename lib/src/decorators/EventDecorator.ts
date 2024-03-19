import { CanvasEvent } from "../classes"
import ICanvasBase from "../interface/ICanvasBase"
import { CanvasEventNamesType } from "../types/CanvasEventNamesType"
import { EventTagType } from "../types/EventTagType"

/**
 * Canvas Event Register
 */
export const registeredEvents: { [name: EventTagType]: typeof CanvasEvent<CanvasEventNamesType> } = {}
/**
 * EventDecorator is a decorator that register a event in the game.
 * Is a required decorator for use the event in the game.
 * Thanks to this decoration the game has the possibility of updating the events to the latest modification and saving the game.
 * @param name is th identifier of the event, by default is the name of the class
 * @returns 
 */
export default function eventDecorator(name?: EventTagType) {
    return function (target: typeof CanvasEvent<any>) {
        if (!name) {
            name = target.name
        }
        if (registeredEvents[name]) {
            console.warn(`Event ${name} already exists, it will be overwritten`)
        }
        registeredEvents[name] = target
    }
}

/**
 * Get an event type by the class name.
 * @param eventName The name of the class.
 * @returns The event type.
 */
export function getEventTypeByClassName<T = typeof CanvasEvent<ICanvasBase<any>>>(eventName: EventTagType): T | undefined {
    try {
        let eventType = registeredEvents[eventName]
        if (!eventType) {
            console.error(`Event ${eventName} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(e)
        return
    }
}

/**
 * Get an event instance by the class name.
 * @param eventName The name of the class.
 * @returns The event instance.
 */
export function getEventInstanceByClassName<T = CanvasEvent<ICanvasBase<any>>>(eventName: EventTagType): T | undefined {
    try {
        let eventType = registeredEvents[eventName]
        if (!eventType) {
            console.error(`Event ${eventName} not found`)
            return
        }
        let event = new eventType()
        return event as T
    }
    catch (e) {
        console.error(e)
        return
    }
}
