import { CanvasEvent } from "../classes/CanvasEvent"
import { GameWindowManager } from "../managers/WindowManager"
import { EventTagType } from "../types/EventTagType"

export function eventDecorator(name?: EventTagType) {
    return function (target: typeof CanvasEvent) {
        if (!name) {
            name = target.name
        }
        if (GameWindowManager.registeredTicker[name]) {
            console.warn(`Label ${name} already exists, it will be overwritten`)
        }
        GameWindowManager.registeredEvent[name] = target
    }
}
