import { UPDATE_PRIORITY } from "pixi.js";
import { TickerArgs } from "../../../interfaces";
import { TickerIdType } from "../../../types/TickerIdType";
import { logger } from "../../../utils/log-utility";
import TickerBase from "../classes/TickerBase";

/**
 * A dictionary that contains all tickers registered and avvailable to be used.
 */
export const registeredTickers: { [name: TickerIdType]: typeof TickerBase } = {};
/**
 * Is a decorator that register a ticker in the game.
 * Is a required decorator for use the ticker in the game.
 * Thanks to this decoration the game has the possibility of updating the tickers to the latest modification and saving the game.
 * @param name is th identifier of the label, by default is the name of the class
 * @returns
 */
export default function tickerDecorator(name?: TickerIdType) {
    return function (target: typeof TickerBase<any>) {
        tickerDecoratorFn(target, name);
    };
}

export function tickerDecoratorFn(target: typeof TickerBase<any>, name?: TickerIdType) {
    if (!name) {
        name = target.name;
    }
    if (registeredTickers[name]) {
        logger.info(`Ticker ${name} already exists, it will be overwritten`);
    }
    target.prototype.id = name;
    registeredTickers[name] = target;
}

/**
 * Get a ticker instance by the id.
 * @param tickerId The id of the ticker.
 * @param args The arguments that you want to pass to the ticker.
 * @param duration The duration of the ticker. If is undefined, the ticker will be called every frame.
 * @param priority The priority of the ticker. If is undefined, the priority will be UPDATE_PRIORITY.NORMAL.
 * @returns The instance of the ticker
 */
export function getTickerInstanceById<TArgs extends TickerArgs>(
    tickerId: TickerIdType,
    args: TArgs,
    duration?: number,
    priority?: UPDATE_PRIORITY
): TickerBase<TArgs> | undefined {
    try {
        let ticker = registeredTickers[tickerId];
        if (!ticker) {
            logger.error(`Ticker ${tickerId} not found, did you forget to register it with the tickerDecorator?`);
            return;
        }
        return new ticker(args, duration, priority);
    } catch (e) {
        logger.error(`Error while getting Ticker ${tickerId}`, e);
        return;
    }
}
