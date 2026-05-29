import { narration } from "../..";

export default interface LabelProps<T, StepIdType = number> {
    /**
     * A function executed before each `step`.
     * @param stepId The index of the `step` being executed
     * @param label The `label` containing the `step`
     * @returns
     * @example
     * ```ts
     * const startLabel = newLabel("start", [
     *     () => {
     *         narration.dialogue = "Step 1"
     *     },
     *     () => {
     *         narration.dialogue = "Step 2"
     *     }
     * ], {
     *     onStepStart: (stepIndex, label) => {
     *         console.log(`Step ${stepIndex} started`)
     *     }
     * })
     * ```
     */
    onStepStart?: (stepId: StepIdType, label: T) => void | Promise<void>;
    /**
     * Is a function that will be executed in {@link onStepStart} if the id of the step is 0
     * and when the user laods a save file.
     * When you load a save file, will be executed all onLoadingLabel functions of the {@link narration.openedLabels}.
     * It is useful for example to make sure all images used have been cached
     * @param stepId The index of the `step` being executed
     * @param label The `label` being executed
     * @returns
     * @example
     * ```ts title="content/labels/start.label.ts"
     * newLabel("start", [], {
     *     onLoadingLabel: async (stepId, label) => {
     *         await Assets.load('path/to/image1.png')
     *         await Assets.load('path/to/image2.png')
     *     }
     * })
     * ```
     */
    onLoadingLabel?: (stepId: StepIdType, label: T) => void | Promise<void>;
    /**
     * A function executed after each `step`. See more <DynamicLink href="/start/labels-advanced#onstepend">here</DynamicLink>.
     * @param stepId The index of the `step` that ended
     * @param label The `label` containing the `step`
     * @returns
     * @example
     * ```ts
     * const startLabel = newLabel("start", [
     *     async () => {
     *         await showImage("image1", "path/to/image1.png")
     *         await showImage("image2", "path/to/image2.png")
     *     }
     * ], {
     *     onLoadingLabel: async (stepIndex, label) => {
     *         await Assets.load("path/to/image1.png")
     *         await Assets.load("path/to/image2.png")
     *     }
     * })
     * ```
     */
    onStepEnd?: (stepId: StepIdType, label: T) => void | Promise<void>;
}
