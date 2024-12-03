import { narration } from ".."
import { Label } from "../classes"

export default interface LabelProps<T> {
    /**
     * Is a function that will be executed before any step is executed.
     * @param stepIndex Step index
     * @param label Label
     * @returns
     */
    onStepStart?: (stepIndex: number, label: T) => void | Promise<void>,
    /**
     * Is a function that will be executed in {@link Label.onStepStart} if the index of the step is 0
     * and when the user goes back to it or when the user laods a save file.
     * When you load a save file, will be executed all onLoadingLabel functions of the {@link narration.openedLabels}.
     * It is useful for example to make sure all images used have been cached
     * @param stepIndex Step index
     * @param label Label
     * @returns
     * @example
     * ```typescript
     * newLabel("id", [], {
     *     onStepStart: async (stepIndex, label) => {
     *         await Assets.load('path/to/image1.png')
     *         await Assets.load('path/to/image2.png')
     *     }
     * })
     * ```
     */
    onLoadingLabel?: (stepIndex: number, label: T) => void | Promise<void>,
    /**
     * Is a function that will be executed when the step ends.
     * @param stepIndex Step index
     * @param label Label
     * @returns
     */
    onStepEnd?: (stepIndex: number, label: T) => void | Promise<void>,
    /**
     * Is the index of the choice that the label will perform. This variable is used in the system.
     */
    choiseIndex?: number
}
