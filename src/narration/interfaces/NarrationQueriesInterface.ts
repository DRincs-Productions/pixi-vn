import type { LabelAbstract } from "..";
import type { LabelIdType } from "../types/LabelIdType";

export default interface NarrationQueriesInterface {
    /**
     * Check if the label is already completed.
     * @param label The label to check.
     * @returns True if the label is already completed.
     */
    isLabelAlreadyCompleted(label: LabelIdType | LabelAbstract<any>): boolean;
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
     * Get times a label has been opened.
     * @param label The label to check.
     * @returns times a label has been opened.
     */
    timesLabelOpened(label: LabelIdType): number;
    /**
     * Get times a choice has been made in the current step.
     * @param index The index of the choice.
     * @returns The number of times the choice has been made.
     */
    timesChoiceMade(index: number): number;
}
