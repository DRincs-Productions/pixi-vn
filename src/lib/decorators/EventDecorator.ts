import { CanvasEvent } from "../classes/CanvasEvent"
import { GameWindowManager } from "../managers/WindowManager"
import { EventTagType } from "../types/EventTagType"

/**
 * EventDecorator is a decorator that register a event in the game.
 * Is a required decorator for use the event in the game.
 * Thanks to this decoration the game has the possibility of updating the events to the latest modification and saving the game.
 * @param name is th identifier of the event, by default is the name of the class
 * @returns 
 */
export function eventDecorator(name?: EventTagType) {
    return function (target: typeof CanvasEvent<any>) {
        if (!name) {
            name = target.name
        }
        if (GameWindowManager.registeredEvent[name]) {
            console.warn(`Event ${name} already exists, it will be overwritten`)
        }
        GameWindowManager.registeredEvent[name] = target
    }
}
