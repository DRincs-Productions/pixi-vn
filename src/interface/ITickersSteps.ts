import { UPDATE_PRIORITY } from "pixi.js"
import { TickerArgsType } from "../classes/ticker/TickerBase"
import { PauseType } from "../types/PauseType"
import { RepeatType } from "../types/RepeatType"

export interface ITickersStep<TArgs extends TickerArgsType> {
    /**
     * Ticker class name
     */
    ticker: string,
    /**
     * Duration in seconds. If is undefined, the step will end only when the animation is finished.
     */
    duration?: number,
    /**
     * Arguments to pass to the ticker
     */
    args: TArgs,
    /**
     * Priority of the ticker
     */
    priority?: UPDATE_PRIORITY
}

/**
 * The steps of the tickers
 */
export default interface ITickersSteps {
    /**
     * The step number
     */
    currentStepNumber: number
    /**
     * The steps of the tickers
     */
    steps: (ITickersStep<any> | RepeatType | PauseType)[]
}
