import { TickerElement } from "../classes/TickerElement"
import { GameWindowManager } from "../managers/WindowManager"

export function tickerDecorator(name?: string) {
    return function (target: typeof TickerElement) {
        if (!name) {
            name = target.name
        }
        if (GameWindowManager.registeredTicker[name]) {
            console.warn(`Label ${name} already exists, it will be overwritten`)
        }
        GameWindowManager.registeredTicker[name] = target
    }
}
