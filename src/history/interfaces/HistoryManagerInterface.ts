import { HistoryInfo } from "@drincs/pixi-vn";
import { HistoryStep, NarrativeHistory } from "../../narration";
import HistoryGameState from "./HistoryGameState";

export default interface HistoryManagerInterface {
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    readonly stepsHistory: HistoryStep[];
    /**
     * Get the narrative history
     * @returns the history of the dialogues, choices and steps
     */
    readonly narrativeHistory: NarrativeHistory[];
    /**
     * The number of steps to keep in the history into the save file.
     *
     * The other older steps will be compressed will be used in {@link HistoryManagerInterface.narrativeHistory} to show the older dialogues.
     * In the compressed steps, the canvas and storage information will be removed.
     *
     * This also means that a player, after saving and loading a save, will only be able to go back to {@link NarrationManagerInterface.stepLimitSaved} steps.
     *
     * If you want to keep all steps in the history, you can set this value to Infinity.
     */
    stepLimitSaved: number;
    /**
     * Delete the narrative history.
     * @param itemsNumber The number of items to delete. If undefined, all items will be deleted.
     */
    removeNarrativeHistory(itemsNumber?: number): void;
    /**
     * Go back to the last step and add it to the history.
     * @param navigate The navigate function.
     * @param steps The number of steps to go back. Must be greater than 0. @default 1
     * @returns
     * @example
     * ```typescript
     * export function goBack(navigate: (path: string) => void | Promise<void>, afterBack?: () => void) {
     *     narration.goBack(navigate)
     *     afterBack && afterBack()
     * }
     * ```
     */
    goBack(navigate: (path: string) => void | Promise<void>, steps?: number): Promise<void>;
    /**
     * Block the go back function.
     */
    blockGoBack(): void;
    /**
     * Return true if it is possible to go back.
     */
    readonly canGoBack: boolean;
    /**
     * Add a step to the history.
     * @param historyInfo Info about the step to add.
     * @param opstions Options to add the step.
     */
    add(
        historyInfo?: HistoryInfo,
        opstions?: {
            /**
             * If true, the step will not be added to the history if the current step is the same as the last step.
             */
            ignoreSameStep?: boolean;
        }
    ): void;
    /**
     * Clear the history.
     */
    clear(): void;

    /* Export and Import Methods */

    /**
     * Export the history to an object.
     * @returns The history in an object.
     */
    export(): HistoryGameState;
    /**
     * Restore the history from an object.
     * @param data The history in an object.
     */
    restore(data: object): Promise<void>;
}
