import { UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType } from "../classes/ticker/TickerBase";
import { geTickerInstanceById } from "../decorators/TickerDecorator";
import { TickerIdType } from "../types/TickerIdType";

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
    /**
     * Get the id of the ticker. This variable is used in the system to get the ticker by id, {@link geTickerInstanceById}
     */
    id: TickerIdType
}
