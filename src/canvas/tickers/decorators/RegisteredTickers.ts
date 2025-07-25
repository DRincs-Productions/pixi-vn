import { UPDATE_PRIORITY } from "pixi.js";
import { CachedMap } from "../../../classes";
import { logger } from "../../../utils/log-utility";
import { TickerIdType } from "../../types/TickerIdType";
import Ticker from "../interfaces/Ticker";
import TickerArgs from "../interfaces/TickerArgs";

/**
 * A dictionary that contains all tickers registered and avvailable to be used.
 */
const registeredTickers = new CachedMap<
    TickerIdType,
    { new (args: any, duration?: number, priority?: UPDATE_PRIORITY): Ticker<any> }
>({ cacheSize: 5 });
/**
 * Is a decorator that register a ticker in the game.
 * Is a required decorator for use the ticker in the game.
 * Thanks to this decoration the game has the possibility of updating the tickers to the latest modification and saving the game.
 * @param name is th identifier of the label, by default is the name of the class
 * @returns
 */
export function tickerDecorator(name?: TickerIdType) {
    return function (target: { new (args: any, duration?: number, priority?: UPDATE_PRIORITY): Ticker<any> }) {
        RegisteredTickers.add(target, name);
    };
}

namespace RegisteredTickers {
    /**
     * Register a ticker in the game.
     * @param target The class of the ticker.
     * @param name Name of the ticker, by default it will use the class name. If the name is already registered, it will show a warning
     */
    export function add(
        target: {
            new (args: any, duration?: number, priority?: UPDATE_PRIORITY): Ticker<any>;
        },
        name?: TickerIdType
    ) {
        if (!name) {
            name = target.name;
        }
        if (registeredTickers.get(name)) {
            logger.info(`Ticker "${name}" already exists, it will be overwritten`);
        }
        target.prototype.id = name;
        registeredTickers.set(name, target);
    }

    /**
     * Get a ticker by the id.
     * @param canvasId The id of the ticker.
     * @returns The ticker type.
     */
    export function get<T = Ticker<any>>(tickerId: TickerIdType): T | undefined {
        try {
            let tickerType = registeredTickers.get(tickerId);
            if (!tickerType) {
                logger.error(`Event "${tickerId}" not found, did you forget to register it with the tickerDecorator?`);
                return;
            }
            return tickerType as T;
        } catch (e) {
            logger.error(`Error while getting Event "${tickerId}"`, e);
            return;
        }
    }

    /**
     * Get a ticker instance by the id.
     * @param tickerId The id of the ticker.
     * @param args The arguments that you want to pass to the ticker.
     * @param duration The duration of the ticker. If is undefined, the ticker will be called every frame.
     * @param priority The priority of the ticker. If is undefined, the priority will be UPDATE_PRIORITY.NORMAL.
     * @returns The instance of the ticker
     */
    export function getInstance<TArgs extends TickerArgs>(
        tickerId: TickerIdType,
        args: TArgs,
        duration?: number,
        priority?: UPDATE_PRIORITY
    ): Ticker<TArgs> | undefined {
        try {
            let ticker = registeredTickers.get(tickerId);
            if (!ticker) {
                logger.error(`Ticker "${tickerId}" not found, did you forget to register it with the tickerDecorator?`);
                return;
            }
            return new ticker(args, duration, priority);
        } catch (e) {
            logger.error(`Error while getting Ticker "${tickerId}"`, e);
            return;
        }
    }

    /**
     * Get a list of all tickers registered.
     * @returns An array of tickers.
     */
    export function values(): {
        new (args: any, duration?: number, priority?: UPDATE_PRIORITY): Ticker<any>;
    }[] {
        return Array.from(registeredTickers.values());
    }

    /**
     * Check if a ticker is registered.
     * @param id The id of the ticker.
     * @returns True if the ticker is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredTickers.has(id);
    }
}
export default RegisteredTickers;
