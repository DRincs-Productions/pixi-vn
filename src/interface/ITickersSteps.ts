import { TickerArgsType } from "../classes/ticker/TickerBase"
import { PauseType } from "../types/PauseType"
import { RepeatType } from "../types/RepeatType"
import ITicker from "./ITicker"

export interface ITickersStep<TArgs extends TickerArgsType> extends ITicker<TArgs> {
    /**
     * Ticker class name
     */
    ticker: string,
    /**
     * Duration in seconds
     */
    duration: number,
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
