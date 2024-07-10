import { UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType } from "../classes/ticker/TickerBase";

export default interface ITicker<TArgs extends TickerArgsType> {
    /**
     * Arguments to pass to the ticker
     */
    args: TArgs,
    /**
     * Duration in seconds to run the ticker
     */
    duration?: number,
    /**
     * Priority of the ticker
     */
    priority?: UPDATE_PRIORITY
}
