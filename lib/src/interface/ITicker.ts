import { UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType } from "../classes/ticker/TickerBase";

export default interface ITicker<TArgs extends TickerArgsType> {
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
