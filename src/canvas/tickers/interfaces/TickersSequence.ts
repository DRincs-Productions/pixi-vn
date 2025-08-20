import { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { PauseType } from "../../types/PauseType";
import { RepeatType } from "../../types/RepeatType";
import TickerArgs from "./TickerArgs";

export interface TickersStep<TArgs extends TickerArgs> {
    /**
     * Ticker class name
     */
    ticker: string;
    /**
     * Duration in seconds. If is undefined, the step will end only when the animation is finished.
     */
    duration?: number;
    /**
     * Arguments to pass to the ticker
     */
    args: TArgs;
    /**
     * Priority of the ticker
     */
    priority?: UPDATE_PRIORITY;
}

/**
 * The steps of the tickers
 */
export default interface TickersSequence {
    /**
     * The step number
     */
    currentStepNumber: number;
    /**
     * The steps of the tickers
     */
    steps: (TickersStep<any> | RepeatType | PauseType)[];
}
