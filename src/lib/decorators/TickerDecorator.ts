import { TickerClass } from "../classes/TickerClass"
import { GameWindowManager } from "../managers/WindowManager"
import { TickerTagType } from "../types/TickerTagType"

/**
 * TickerDecorator is a decorator that register a ticker in the game.
 * Is a required decorator for use the ticker in the game.
 * Thanks to this decoration the game has the possibility of updating the tickers to the latest modification and saving the game.
 * @param name is th identifier of the label, by default is the name of the class
 * @returns 
 */
export function tickerDecorator(name?: TickerTagType) {
    return function (target: typeof TickerClass<any>) {
        if (!name) {
            name = target.name
        }
        if (GameWindowManager.registeredTicker[name]) {
            console.warn(`Label ${name} already exists, it will be overwritten`)
        }
        GameWindowManager.registeredTicker[name] = target
    }
}
