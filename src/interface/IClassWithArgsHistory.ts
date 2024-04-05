import { TickerCallback, UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType } from "../classes/ticker/TickerBase";
import { TickerIdType } from "../types/TickerIdType";

/**
 * IClassWithArgsHistory is a class that contains the name of a class and the arguments that were used to create it.
 */
export interface IClassWithArgsHistory<TArgs extends TickerArgsType> {
    fn: TickerCallback<any>,
    className: TickerIdType,
    args: TArgs
    canvasElementTags: string[],
    priority?: UPDATE_PRIORITY,
    duration?: number
}

export interface IClassWithArgsHistoryForExport<TArgs extends TickerArgsType> {
    className: TickerIdType,
    args: TArgs
    canvasElementTags: string[],
    priority?: UPDATE_PRIORITY,
    duration?: number
}
