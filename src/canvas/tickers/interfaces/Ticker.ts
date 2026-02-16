import type { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { TickerIdType } from "../../types/TickerIdType";
import RegisteredTickers from "../decorators/RegisteredTickers";
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
     * Get the alias of the ticker class. This variable is used in the system to get the ticker class by id, {@link RegisteredTickers.getInstance}
     */
    readonly alias: TickerIdType;
    /**
     * The id of the ticker. Must be unique for each ticker instance.
     */
    readonly id: string;
    /**
     * The aliases of the canvas elements that are connected to this ticker
     */
    canvasElementAliases: string[];
    /**
     * Completes the animation and applies the final state.
     */
    complete: (options?: { ignoreTickerSteps?: boolean }) => Promise<void> | void;
    /**
     * Stops the animation at its current state, and prevents it from resuming when the animation is played again.
     */
    stop: () => void;
    /**
     * Starts the ticker. This will start the ticker and begin the animation.
     */
    start: () => void;
    /**
     * Pauses the animation.
     */
    pause: () => void;
    /**
     * Plays the animation.
     */
    play: () => void;
    /**
     * Checks if the ticker is paused.
     * @returns true if the ticker is paused, false otherwise.
     */
    readonly paused: boolean;
}
