import { Dialogue } from "../..";
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
}
