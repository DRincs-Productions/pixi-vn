import { UPDATE_PRIORITY } from "pixi.js";
import { TickerIdType } from "../../types/TickerIdType";
import Ticker from "./Ticker";
import TickerArgs from "./TickerArgs";

/**
 * TickerHistory is a class that contains the name of a class and the arguments that were used to create it.
 */
export default interface TickerInfo<TArgs extends TickerArgs> {
    id: TickerIdType;
    /**
     * If this ticker was created by steps
     */
    createdByTicketSteps?: {
        canvasElementAlias: string;
        id: string;
    };
    ticker: Ticker<TArgs>;
}

export interface TickerHistory<TArgs extends TickerArgs> {
    id: TickerIdType;
    args: TArgs;
    /**
     * The aliases of the canvas elements that are connected to this ticker
     */
    canvasElementAliases: string[];
    priority?: UPDATE_PRIORITY;
    duration?: number;
}
