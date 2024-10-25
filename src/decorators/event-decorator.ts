import { CanvasEvent } from "../classes"
import CanvasBase from "../classes/canvas/CanvasBase"
import { CanvasEventNamesType } from "../types"
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
            console.info(`[Pixi’VN] Event ${name} already exists, it will be overwritten`)
        }
        target.prototype.id = name
        registeredEvents[name] = target
    }
}

/**
 * Get an event by the id.
 * @param eventId The id of the event.
 * @returns The event type.
 */
export function getEventTypeById<T = typeof CanvasEvent<CanvasBase<any>>>(eventId: EventIdType): T | undefined {
    try {
        let eventType = registeredEvents[eventId]
        if (!eventType) {
            console.error(`[Pixi’VN] Event ${eventId} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(`[Pixi’VN] Error while getting Event ${eventId}`, e)
        return
    }
}

/**
 * Get an event instance by the id.
 * @param eventId The id of the event.
 * @returns The event instance.
 */
export function getEventInstanceById<T = CanvasEvent<CanvasBase<any>>>(eventId: EventIdType): T | undefined {
    try {
        let eventType = registeredEvents[eventId]
        if (!eventType) {
            console.error(`[Pixi’VN] Event ${eventId} not found`)
            return
        }
        let event = new eventType()
        return event as T
    }
    catch (e) {
        console.error(`[Pixi’VN] Error while getting Event ${eventId}`, e)
        return
    }
}
