import { CharacterInterface } from "@drincs/pixi-vn";
import {
    ChoiceMenuOption,
    ChoiceMenuOptionClose,
    ChoiceMenuOptionsType,
    Dialogue,
    ExportedStep,
    InputInfo,
    Label,
    LabelAbstract,
    NarrativeHistory,
    OpenedLabel,
    StepLabelPropsType,
    StepLabelResultType,
    StepLabelType,
    StorageElementType,
} from "../..";
import { LabelIdType } from "../types/LabelIdType";
import HistoryStep from "./HistoryStep";

export default interface NarrationManagerInterface {
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    readonly stepsHistory: HistoryStep<Dialogue>[];
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
     * **Not is the {@link NarrationManagerInterface.stepsHistory}.length - 1.**
     */
    readonly stepCounter: number;
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
    /**
     * Save the current step to the history.
     */
    addCurrentStepToHistory(): void;

    /* Run Methods */

    /**
     * Return if can go to the next step.
     * @returns True if can go to the next step.
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
     *     narration.goNext(yourParams)
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
    goNext(
        props: StepLabelPropsType,
        options?: {
            /**
             * The index of the choise made by the player. (This params is used in the choice menu)
             */
            choiseMade?: number;
            /**
             * If true, ignore the running step, ignore the choice menu/required input and run the next step immediately.
             */
            runNow?: boolean;
        }
    ): Promise<StepLabelResultType>;
    /**
     * Execute the label and add it to the history. (It's similar to Ren'Py's call function)
     * @param label The label to execute or the id of the label
     * @param props The props to pass to the label.
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * narration.callLabel(startLabel, yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     * @example
     * ```typescript
     * // if you use it in a step label you should return the result.
     * return narration.callLabel(startLabel).then((result) => {
     *     return result
     * })
     * ```
     */
    callLabel<T extends {} = {}>(
        label: Label<T> | LabelIdType,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;
    /**
     * Execute the label, close the current label, execute the new label and add the new label to the history. (It's similar to Ren'Py's jump function)
     * @param label The label to execute.
     * @param props The props to pass to the label or the id of the label
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * narration.jumpLabel(startLabel, yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     * @example
     * ```typescript
     * // if you use it in a step label you should return the result.
     * return narration.jumpLabel(startLabel).then((result) => {
     *     return result
     * })
     * ```
     */
    jumpLabel<T extends {}>(label: Label<T> | LabelIdType, props: StepLabelPropsType<T>): Promise<StepLabelResultType>;
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
        item: ChoiceMenuOptionClose | ChoiceMenuOption<T>,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;
    /**
     * When the player is in a choice menu, can use this function to exit to the choice menu.
     * @param choice
     * @param props
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * narration.closeChoiceMenu(yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     */
    closeChoiceMenu<T extends {} = {}>(
        choice: ChoiceMenuOptionClose<T>,
        props: StepLabelPropsType<T>
    ): Promise<StepLabelResultType>;

    /** Old Step Methods */

    /**
     * The number of steps to keep in the history into the save file.
     *
     * The other older steps will be compressed will be used in {@link NarrationManagerInterface.narrativeHistory} to show the older dialogues.
     * In the compressed steps, the canvas and storage information will be removed.
     *
     * This also means that a player, after saving and loading a save, will only be able to go back to {@link NarrationManagerInterface.stepLimitSaved} steps.
     *
     * If you want to keep all steps in the history, you can set this value to Infinity.
     */
    stepLimitSaved: number;

    /* Go Back & Refresh Methods */

    /**
     * Go back to the last step and add it to the history.
     * @param navigate The navigate function.
     * @param steps The number of steps to go back. Must be greater than 0. @default 1
     * @returns
     * @example
     * ```typescript
     * export function goBack(navigate: (path: string) => void, afterBack?: () => void) {
     *     narration.goBack(navigate)
     *     afterBack && afterBack()
     * }
     * ```
     */
    goBack(navigate: (path: string) => void, steps?: number): Promise<void>;
    /**
     * Return true if it is possible to go back.
     */
    readonly canGoBack: boolean;
    /**
     * Block the go back function.
     */
    blockGoBack(): void;
    /**
     * Function to be executed at the end of the game. It should be set in the game initialization.
     * @example
     * ```typescript
     * narration.onGameEnd = async (props) => {
     *    props.navigate("/end")
     * }
     * ```
     */
    onGameEnd: StepLabelType | undefined;
    /**
     * Function to be executed when an error occurs in the step.
     * @example
     * ```typescript
     * narration.onStepError = (error, props) => {
     *    props.notify("An error occurred")
     *    // send a notification to GlitchTip, Sentry, etc...
     * }
     * ```
     */
    onStepError: ((error: any, props: StepLabelPropsType) => void) | undefined;

    /**
     * Dialogue to be shown in the game
     */
    get dialogue(): Dialogue | undefined;
    /**
     * Dialogue to be shown in the game
     */
    set dialogue(
        props:
            | {
                  character: string | CharacterInterface;
                  text: string | string[];
              }
            | string
            | string[]
            | Dialogue
            | undefined
    );
    /**
     * The options to be shown in the game
     * @example
     * ```typescript
     * narration.choiceMenuOptions = [
     *     new ChoiceMenuOption("Events Test", EventsTestLabel, {}),
     *     new ChoiceMenuOption("Show Image Test", ShowImageTest, { image: "imageId" }, "call"),
     *     new ChoiceMenuOption("Ticker Test", TickerTestLabel, {}),
     *     new ChoiceMenuOption("Tinting Test", TintingTestLabel, {}, "jump"),
     *     new ChoiceMenuOption("Base Canvas Element Test", BaseCanvasElementTestLabel, {})
     * ]
     * ```
     */
    choiceMenuOptions: ChoiceMenuOptionsType<any> | undefined;
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
     * Add a label to the history.
     */
    clear(): void;

    /* Export and Import Methods */

    /**
     * Export the history to a JSON string.
     * @returns The history in a JSON string.
     */
    exportJson(): string;
    /**
     * Export the history to an object.
     * @returns The history in an object.
     */
    export(): ExportedStep;
    /**
     * Import the history from a JSON string.
     * @param dataString The history in a JSON string.
     */
    importJson(dataString: string): Promise<void>;
    /**
     * Import the history from an object.
     * @param data The history in an object.
     */
    import(data: object): Promise<void>;
}
