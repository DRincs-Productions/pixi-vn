import { GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import deepDiff from "deep-diff";
import { Difference } from "microdiff";
import { CachedMap } from "../../classes";
import { HistoryStep, NarrationHistory } from "../../narration";
import HistoryGameState from "./HistoryGameState";

export default interface HistoryManagerInterface {
    /**
     * Get the narrative history.
     * @returns the history of the dialogues, choices and steps
     */
    readonly narrativeHistory: NarrationHistory[];
    /**
     * Get the history of the last steps belonging to the current label.
     *
     * For example, if the current label A called label B in step 3, and label B was closed and we went on to step 6 of A. the result will include points 4 5 6 of label A
     * @returns the history of the dialogues, choices and steps
     */
    readonly latestCurrentLabelHistory: NarrationHistory[];
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

    /* Map Methods */

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
    /**
     * Number of items in the history.
     */
    readonly size: number;
    /**
     * Get the last key (id) of the history.
     */
    readonly lastKey: number | null;
    /**
     * Get all the keys (id) of the history.
     */
    keys(): MapIterator<number>;
    /**
     * Get a step from the history.
     *
     * **Note:** If the step not contains any information, this method will return undefined.
     * @param stepIndex The key (id) of the step to get.
     * @returns The step.
     */
    get(stepIndex: number): NarrationHistory | undefined;
    /**
     * Remove a step from the history.
     * @param stepIndex The key (id) of the step to remove.
     * @returns True if the step was removed, false if it was not found.
     */
    delete(stepIndex: number): void;
    /**
     * Map that contains all information about the steps in the history.
     *
     * **Don't edit unless you're sure what you're doing.**
     */
    readonly stepsInfoMap: CachedMap<number, Omit<HistoryStep, "diff">>;
    /**
     * Map that contains all the differences between the steps in the history.
     * The differences will be used to restore a step.
     *
     * **Don't edit unless you're sure what you're doing.**
     */
    readonly diffMap: CachedMap<number, deepDiff.Diff<GameStepState, GameStepState>[] | Difference[]>;
    /**
     * Map that contains all the narration history.
     *
     * **Don't edit unless you're sure what you're doing.**
     */
    readonly narrationMap: CachedMap<number, NarrationHistory>;

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
