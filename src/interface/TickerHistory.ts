import { TickerCallback, UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType } from "../classes/ticker/TickerBase";
import { TickerIdType } from "../types/TickerIdType";

/**
 * TickerHistory is a class that contains the name of a class and the arguments that were used to create it.
 */
export default interface TickerHistory<TArgs extends TickerArgsType> {
    fn: TickerCallback<any>,
    id: TickerIdType,
    args: TArgs
    /**
     * The aliases of the canvas elements that are connected to this ticker
     */
    canvasElementAliases: string[],
    priority?: UPDATE_PRIORITY,
    duration?: number
    /**
     * If this ticker was created by steps
     */
    createdByTicketStepsId?: {
        alias: string,
        stepId: string,
    }
}

export interface TickerHistoryForExport<TArgs extends TickerArgsType> {
    id: TickerIdType,
    args: TArgs
    /**
     * The aliases of the canvas elements that are connected to this ticker
     */
    canvasElementAliases: string[],
    priority?: UPDATE_PRIORITY,
    duration?: number
}
