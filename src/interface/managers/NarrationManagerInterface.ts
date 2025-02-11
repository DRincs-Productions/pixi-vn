import { Dialogue, Label, LabelAbstract, NarrativeHistory, OpenedLabel } from "../..";
import { LabelIdType } from "../../types/LabelIdType";
import HistoryStep from "../HistoryStep";

export default interface NarrationManagerInterface {
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    readonly stepsHistory: HistoryStep<Dialogue>[];
    /**
     * Counter of execution times of the current step. Current execution is also included.
     * **Attention**: if the step index is edited or the code of step is edited, the counter will be reset.
     * You can restart the counter in this way:
     * ```typescript
     * narration.currentStepTimesCounter = 0
     * ```
     */
    currentStepTimesCounter: number;
    /**
     * Get a random number between min and max.
     * @param min The minimum number.
     * @param max The maximum number.
     * @param options The options.
     * @returns The random number or undefined. If options.onceonly is true and all numbers between min and max have already been generated, it will return undefined.
     */
    getRandomNumber(
        min: number,
        max: number,
        options?: {
            /**
             * If true, the number will be generated only once on the current step of the label.
             * @default false
             */
            onceOnly?: boolean;
        }
    ): number | undefined;
    /**
     * lastStepIndex is the last step index that occurred during the progression of the steps. **Not is the length of the stepsHistory - 1.**
     */
    readonly lastStepIndex: number;
    /**
     * The stack of the opened labels.
     */
    readonly openedLabels: OpenedLabel[];
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    readonly currentLabel: Label | undefined;

    /* Edit History Methods */

    /**
     * Close the current label and add it to the history.
     * @returns
     */
    closeCurrentLabel(): void;
    /**
     * Close all labels and add them to the history. **Attention: This method can cause an unhandled game ending.**
     */
    closeAllLabels(): void;
    /**
     * Get the narrative history
     * @returns the history of the dialogues, choices and steps
     */
    readonly narrativeHistory: NarrativeHistory[];
    /**
     * Delete the narrative history.
     * @param itemsNumber The number of items to delete. If undefined, all items will be deleted.
     */
    removeNarrativeHistory(itemsNumber?: number): void;
    /**
     * Check if the label is already completed.
     * @param label The label to check.
     * @returns True if the label is already completed.
     */
    isLabelAlreadyCompleted<Label extends LabelAbstract<any>>(label: LabelIdType | Label): boolean;
    /**
     * Get the choices already made in the current step. **Attention**: if the choice step index is edited or the code of choice step is edited, the result will be wrong.
     * @returns The choices already made in the current step. If there are no choices, it will return undefined.
     */
    readonly alreadyCurrentStepMadeChoices: number[] | undefined;
    /**
     * Check if the current step is already completed.
     * @returns True if the current step is already completed.
     */
    readonly isCurrentStepAlreadyOpened: boolean;
    /**
     * Get times a label has been opened
     * @returns times a label has been opened
     */
    getTimesLabelOpened(label: LabelIdType): number;
    /**
     * Get times a choice has been made in the current step.
     * @param index The index of the choice.
     * @returns The number of times the choice has been made.
     */
    getTimesChoiceMade(index: number): number;

    /* Run Methods */
}
