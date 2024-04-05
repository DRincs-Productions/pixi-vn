import { UPDATE_PRIORITY } from "pixi.js"
import TickerBase, { TickerArgsType } from "../classes/ticker/TickerBase"
import { TickerIdType } from "../types/TickerIdType"

/**
 * A dictionary that contains all tickers registered and avvailable to be used.
 */
export const registeredTickers: { [name: TickerIdType]: typeof TickerBase } = {}
/**
 * Is a decorator that register a ticker in the game.
 * Is a required decorator for use the ticker in the game.
 * Thanks to this decoration the game has the possibility of updating the tickers to the latest modification and saving the game.
 * @param name is th identifier of the label, by default is the name of the class
 * @returns 
 */
export default function tickerDecorator(name?: TickerIdType) {
    return function (target: typeof TickerBase<any>) {
        if (!name) {
            name = target.name
        }
        if (registeredTickers[name]) {
            console.warn(`Ticker ${name} already exists, it will be overwritten`)
        }
        registeredTickers[name] = target
    }
}

/**
 * Get a ticker instance by the class name.
 * @param tickerName The name of the class.
 * @returns The ticker instance.
 */
export function geTickerInstanceByClassName<TArgs extends TickerArgsType>(tickerName: TickerIdType, args: TArgs, duration?: number, priority?: UPDATE_PRIORITY): TickerBase<TArgs> | undefined {
    try {
        let ticker = registeredTickers[tickerName]
        if (!ticker) {
            console.error(`Ticker ${tickerName} not found`)
            return
        }
        return new ticker(args, duration, priority)
    }
    catch (e) {
        console.error(e)
        return
    }
}
