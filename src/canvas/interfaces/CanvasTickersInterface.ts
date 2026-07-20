import type { Ticker, TickerArgs, TickerInfo, TickersSequence } from "../tickers";
import type { PauseType } from "../types/PauseType";
import type { RepeatType } from "../types/RepeatType";

export default interface CanvasTickersInterface {
    /**
     * Transfer the tickers from an old alias to a new alias.
     * @param oldAlias Old alias
     * @param newAlias New alias
     * @param mode If "move", the old alias will be removed from the ticker. If "duplicate", the old alias will be kept in the ticker.
     */
    transfer(oldAlias: string, newAlias: string, mode?: "move" | "duplicate"): void;
    /**
     * Currently tickers that are running.
     */
    readonly currentTickers: Map<string, TickerInfo<any>>;
    /**
     * The steps of the tickers
     */
    readonly currentTickersSteps: Map<string, Map<string, TickersSequence>>;
    /**
     * Find a ticker by its id.
     * @param tickerId The id of the ticker to be found.
     * @param args The args of the ticker.
     * @returns The ticker if found, undefined otherwise.
     */
    find<TArgs extends TickerArgs>(tickerId: string, args?: TArgs): Ticker<TArgs> | undefined;
    /**
     * Run a ticker. You can run multiple add with the same alias and different tickerClasses.
     * If you run a ticker with the same alias and tickerClass, the old ticker will be removed.
     * If already exists a sequence of tickers with the same alias, it will be removed.
     * @param canvasElementAlias The alias of the canvas element that will use the ticker.
     * @param ticker The ticker class to be run.
     * @returns The id of the ticker that was added.
     * @example
     * ```ts
     * canvas.tickers.add("alien", new RotateTicker({ speed: 0.2 }))
     * ```
     */
    add<TArgs extends TickerArgs>(
        canvasElementAlias: string | string[],
        ticker: Ticker<TArgs>,
    ): string | undefined;
    /**
     * Run a sequence of tickers.
     * @param alias The alias of canvas element that will use the tickers.
     * @param steps The steps of the tickers.
     * @param currentStepNumber The current step number. It is used to continue the sequence of tickers.
     * @returns The id of tickers.
     * @example
     * ```ts
     * canvas.tickers.addSequence("alien", [
     *     new RotateTicker({ speed: 0.1, clockwise: true }, 2), // 2 seconds
     *     Pause(1), // 1 second
     *     new RotateTicker({ speed: 0.2, clockwise: false }, 2),
     *     Repeat,
     * ])
     * ```
     * @deprecated
     */
    addSequence(
        alias: string,
        steps: (Ticker<any> | RepeatType | PauseType)[],
        currentStepNumber?: number,
    ): string | undefined;
    /**
     * Remove a connection between a canvas element and a ticker.
     * And remove the ticker if there is no canvas element connected to it.
     * @param alias The alias of the canvas element that will use the ticker.
     * @param ticker The ticker class to be removed.
     * @example
     * ```ts
     * canvas.tickers.unlinkComponent("alien", RotateTicker)
     * ```
     * @deprecated
     */
    unlinkComponent(alias: string | string[], ticker?: { new (): Ticker<any> } | string): void;
    /**
     * Remove all tickers from the canvas.
     */
    removeAll(): void;
    /**
     * Remove a ticker by the id.
     * @param tickerId The id or an array of ids of the ticker to be removed.
     */
    remove(tickerId: string | string[]): void;
    /**
     * Pause a ticker. If a paused ticker have a time to be removed, it will be removed after the time.
     * @param filters The filters to pause the ticker.
     * @returns The ids of the paused tickers.
     */
    pause(
        filters:
            | {
                  /**
                   * The alias of the canvas element that will use the ticker.
                   * Will pause all tickers that are connected to this canvas element.
                   */
                  canvasAlias: string;
                  /**
                   * Ticker ids excluded from the pause. If not provided, all tickers will be paused.
                   */
                  tickerIdsExcluded?: string[];
              }
            | {
                  /**
                   * The id of the ticker to be paused. If provided, only this ticker will be paused.
                   */
                  id: string | string[];
              },
    ): string[];
    /**
     * Resume a ticker.
     * @param filters The filters to resume the ticker.
     */
    resume(
        filters:
            | {
                  /**
                   * The alias of the canvas element that will use the ticker.
                   * Will resume all tickers that are connected to this canvas element.
                   */
                  canvasAlias: string;
              }
            | {
                  /**
                   * The id of the ticker to be resumed. If provided, only this ticker will be resumed.
                   */
                  id: string | string[];
              },
    ): void;
    /**
     * Check if a ticker is paused.
     * @param alias The alias of the canvas element that will use the ticker.
     * @param tickerId The ticker that will be checked.
     * @returns If the ticker is paused.
     */
    isPaused(alias: string, tickerId?: string): boolean;
    /**
     * Add a ticker that must be completed before the next step.
     * This method is used for example into a transition between scenes.
     * @param step The step that the ticker must be completed before the next step.
     */
    completeOnStepEnd(step: {
        /**
         * The id of the step.
         */
        id: string;
        /**
         * If is a sequence of tickers, the alias of the sequence of tickers.
         */
        alias?: string;
    }): void;
    /**
     * This method force the completion of the tickers that are running.
     * This funcions is called in the next step.
     * @param id The id of the ticker. If the alias provided, the id is the id of the sequence of tickers.
     * @param alias The alias of the sequence of tickers.
     */
    forceCompletion(id: string, alias?: string): Promise<void>;
    onComplete(
        tickerId: string,
        options: {
            aliasToRemoveAfter: string[];
            tickerAliasToResume: string[];
            tickerIdToResume: string[];
            ignoreTickerSteps?: boolean;
            stopTicker?: boolean;
        },
    ): void;
}
