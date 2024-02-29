import { TickerArgsType } from "../classes/TickerClass"

export interface ITickersStep<TArgs extends TickerArgsType, T2> {
    /**
     * Ticker class name
     */
    className: T2,
    /**
     * Arguments to pass to the ticker
     */
    args: TArgs,
    /**
     * Duration in milliseconds
     */
    duration: number,
}

/**
 * The steps of the tickers
 */
export interface ITickersSteps<T2> {
    /**
     * The step number
     */
    currentStepNumber: number
    /**
     * The steps of the tickers
     */
    steps: ITickersStep<any, T2>[]
}
