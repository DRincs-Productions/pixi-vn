import { Label, narration } from "../..";

export default interface LabelProps<T, StepIdType = number> {
    /**
     * Is a function that will be executed before any step is executed.
     * @param stepId Step id
     * @param label Label
     * @returns
     */
    onStepStart?: (stepId: StepIdType, label: T) => void | Promise<void>;
    /**
     * Is a function that will be executed in {@link Label.onStepStart} if the id of the step is 0
     * and when the user laods a save file.
     * When you load a save file, will be executed all onLoadingLabel functions of the {@link narration.openedLabels}.
     * It is useful for example to make sure all images used have been cached
     * @param stepId Step id
     * @param label Label
     * @returns
     * @example
     * ```typescript
     * newLabel("id", [], {
     *     onLoadingLabel: async (stepId, label) => {
     *         await Assets.load('path/to/image1.png')
     *         await Assets.load('path/to/image2.png')
     *     }
     * })
     * ```
     */
    onLoadingLabel?: (stepId: StepIdType, label: T) => void | Promise<void>;
    /**
     * Is a function that will be executed when the step ends.
     * @param stepId Step id
     * @param label Label
     * @returns
     */
    onStepEnd?: (stepId: StepIdType, label: T) => void | Promise<void>;
    /**
     * Is the index of the choice that the label will perform. This variable is used in the system.
     */
    choiseIndex?: number;
}
