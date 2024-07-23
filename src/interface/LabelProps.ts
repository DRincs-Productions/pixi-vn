import { Label } from "../classes"

export default interface LabelProps<T extends {}> {
    /**
     * Is a function that will be executed before any step is executed, is useful for example to make sure all images used have been cached.
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
    onStepStart?: (stepIndex: number, label: Label<T>) => void | Promise<void>,
    /**
     * Is a function that will be executed in {@link Label#onStepStart} and when the user goes back to it or when the user laods a save file.
     * @param stepIndex Step index
     * @param label Label
     * @returns 
     */
    onLoadStep?: (stepIndex: number, label: Label<T>) => void | Promise<void>,
    /**
     * Is the index of the choice that the label will perform. This variable is used in the system.
     */
    choiseIndex?: number
}
