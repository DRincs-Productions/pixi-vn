import { UPDATE_PRIORITY } from "pixi.js";
import { TickerIdType } from "../../types/TickerIdType";
import RegisteredTickers from "../decorators/ticker-decorator";
import TickerArgs from "./TickerArgs";

export default interface Ticker<TArgs extends TickerArgs> {
    /**
     * Arguments to pass to the ticker
     */
    args: TArgs;
    /**
     * Duration in seconds to run the ticker
     */
    duration?: number;
    /**
     * Priority of the ticker
     */
    priority?: UPDATE_PRIORITY;
    /**
     * Get the id of the ticker. This variable is used in the system to get the ticker by id, {@link RegisteredTickers.getInstance}
     */
    id: TickerIdType;
    /**
     * Completes the animation and applies the final state.
     */
    complete: () => void;
    /**
     * Stops the animation at its current state, and prevents it from resuming when the animation is played again.
     */
    stop: () => void;
}
