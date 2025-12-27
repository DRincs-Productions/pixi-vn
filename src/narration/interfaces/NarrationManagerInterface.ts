import {
    DialogueInterface,
    InputInfo,
    LabelAbstract,
    NarrationGameState,
    OpenedLabel,
    StepLabelPropsType,
    StepLabelResultType,
    StoredChoiceInterface,
    StoredIndexedChoiceInterface,
} from "..";
import { StorageElementType } from "../../storage";
import { LabelIdType } from "../types/LabelIdType";
import HistoryStep from "./HistoryStep";

export default interface NarrationManagerInterface {
    /**
     * Counter of execution times of the current step. Current execution is also included. Starts from 1.
     *
     * **Attention**: if the step index is edited or the code of step is edited, the counter will be reset.
     *
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
     * This counter corresponds to the total number of steps that have been executed so far.
     *
     * **Not is the {@link history.stepsHistory}.length - 1.**
     */
    readonly stepCounter: number;
    /**
     * The stack of the opened labels.
     */
    readonly openedLabels: OpenedLabel[];
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    readonly currentLabel: LabelAbstract<any> | undefined;

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
    /**
     * Save the current step to the history.
     */
    addCurrentStepToHistory(): void;

    /* Run Methods */

    /**
     * Return if can go to the next step.
     * @returns True if can go to the next step.
     */
    readonly canContinue: boolean;
    /**
     * @deprecated use {@link canContinue} instead.
     */
    readonly canGoNext: boolean;
    /**
     * Execute the next step and add it to the history. If a step is already running, it will put the request in the queue,
     * and when the step is finished, it will execute the next step.
     * @param props The props to pass to the step.
     * @param options The options.
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     *     function nextOnClick() {
     *     setLoading(true)
     *     narration.continue(yourParams)
     *         .then((result) => {
     *             setUpdate((p) => p + 1)
     *             setLoading(false)
     *             if (result) {
     *                 // your code
     *             }
     *         })
     *         .catch((e) => {
     *             setLoading(false)
     *             console.error(e)
     *         })
     * }
     * ```
     */
    continue: (
        props: StepLabelPropsType,
        options?: {
            /**
             * The number of steps to go forward. Should be greater than 0. If a value less than or equal to 0 is
             * provided, the implementation will emit a warning and return early without advancing steps. @default 1
             */
            steps?: number;
            /**
             * If true, ignore the running step, ignore the choice menu/required input and run the next step immediately.
             */
            runNow?: boolean;
        }
    ) => Promise<StepLabelResultType>;
    /**
     * Execute the label and add it to the history. (It's similar to Ren'Py's call function)
     * @param label The label to execute or the id of the label
     * @param props The props to pass to the label.
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * narration.call(startLabel, yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     * @example
     * ```typescript
     * // if you use it in a step label you should return the result.
     * return narration.call(startLabel).then((result) => {
     *     return result
     * })
     * ```
     */
    call<T extends {} = {}>(
        label: LabelAbstract<any, T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;
    /**
     * @deprecated use {@link call} instead.
     */
    callLabel<T extends {} = {}>(
        label: LabelAbstract<any, T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;
    /**
     * Execute the label, close the current label, execute the new label and add the new label to the history. (It's similar to Ren'Py's jump function)
     * @param label The label to execute.
     * @param props The props to pass to the label or the id of the label
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * narration.jump(startLabel, yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     * @example
     * ```typescript
     * // if you use it in a step label you should return the result.
     * return narration.jump(startLabel).then((result) => {
     *     return result
     * })
     * ```
     */
    jump<T extends {}>(
        label: LabelAbstract<any, T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;
    /**
     * @deprecated use {@link jump} instead.
     **/
    jumpLabel<T extends {}>(
        label: LabelAbstract<any, T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;
    /**
     * Select a choice from the choice menu. and close the choice menu.
     * @param item
     * @param props
     * @returns
     * @example
     * ```typescript
     * narration.selectChoice(item, {
     *     navigate: navigate,
     *     // your props
     *     ...item.props
     * })
     *     .then(() => {
     *         // your code
     *     })
     *     .catch((e) => {
     *         // your code
     *     })
     * ```
     */
    selectChoice<T extends {}>(
        item: StoredIndexedChoiceInterface,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;

    /** Old Step Methods */

    /* Go Back & Refresh Methods */

    /**
     * Dialogue to be shown in the game
     */
    get dialogue(): DialogueInterface | undefined;
    /**
     * Dialogue to be shown in the game
     */
    set dialogue(props: DialogueInterface | string | string[] | undefined);
    /**
     * The options to be shown in the game
     * @example
     * ```typescript
     * narration.choices = [
     *     newChoiceOption("Events Test", EventsTestLabel, {}),
     *     newChoiceOption("Show Image Test", ShowImageTest, { image: "imageId" }, "call"),
     *     newChoiceOption("Ticker Test", TickerTestLabel, {}),
     *     newChoiceOption("Tinting Test", TintingTestLabel, {}, "jump"),
     *     newChoiceOption("Base Canvas Element Test", BaseCanvasElementTestLabel, {})
     * ]
     * ```
     */
    get choices(): StoredIndexedChoiceInterface[] | undefined;
    /**
     * @deprecated use {@link choices} instead.
     */
    get choiceMenuOptions(): StoredIndexedChoiceInterface[] | undefined;
    /**
     * The options to be shown in the game
     * @example
     * ```typescript
     * narration.choices = [
     *     newChoiceOption("Events Test", EventsTestLabel, {}),
     *     newChoiceOption("Show Image Test", ShowImageTest, { image: "imageId" }, "call"),
     *     newChoiceOption("Ticker Test", TickerTestLabel, {}),
     *     newChoiceOption("Tinting Test", TintingTestLabel, {}, "jump"),
     *     newChoiceOption("Base Canvas Element Test", BaseCanvasElementTestLabel, {})
     * ]
     * ```
     */
    set choices(data: StoredChoiceInterface[] | undefined);
    /**
     * @deprecated use {@link choices} instead.
     */
    set choiceMenuOptions(data: StoredChoiceInterface[] | undefined);
    /**
     * If true, the next dialogue text will be added to the current dialogue text.
     */
    dialogGlue: boolean;
    /**
     * The input value to be inserted by the player.
     */
    inputValue: StorageElementType;
    /**
     * If true, the player must enter a value.
     */
    readonly isRequiredInput: boolean;
    readonly inputType: string | undefined;
    /**
     * Request input from the player.
     * @param info The input value to be inserted by the player.
     * @param defaultValue The default value to be inserted.
     */
    requestInput(info: Omit<InputInfo, "isRequired">, defaultValue?: StorageElementType): void;
    /**
     * Remove the input request.
     */
    removeInputRequest(): void;

    /**
     * Clear all narration data
     */
    clear(): void;

    /* Export and Import Methods */

    /**
     * Export the narration to an object.
     * @returns The narration in an object.
     */
    export(): NarrationGameState;
    /**
     * Restore the narration from an object.
     * @param data The narration in an object.
     */
    restore(data: object, lastHistoryStep: Omit<HistoryStep, "diff"> | null): Promise<void>;
}
