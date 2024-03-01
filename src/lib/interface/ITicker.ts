import { UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType } from "../classes/TickerClass";

export interface ITicker<TArgs extends TickerArgsType> {
    /**
     * Arguments to pass to the ticker
     */
    args: TArgs,
    /**
     * Duration in milliseconds
     */
    duration?: number,
    /**
     * Priority of the ticker
     */
    priority?: UPDATE_PRIORITY
}
