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
}
