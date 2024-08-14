import { diff } from "deep-diff"
import { DialogueBaseModel, Label } from "../classes"
import { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption"
import newCloseLabel, { CLOSE_LABEL_ID } from "../classes/CloseLabel"
import LabelAbstract from "../classes/LabelAbstract"
import { getLabelById } from "../decorators/LabelDecorator"
import { getChoiceMenuOptions, getDialogue } from "../functions"
import { restoreDeepDiffChanges } from "../functions/DiffUtility"
import { createExportableElement } from "../functions/ExportUtility"
import { getStepSha1 } from "../functions/StepLabelUtility"
import { NarrativeHistory } from "../interface"
import ExportedStep from "../interface/export/ExportedStep"
import IHistoryStep, { IHistoryStepData } from "../interface/IHistoryStep"
import IOpenedLabel from "../interface/IOpenedLabel"
import { HistoryChoiceMenuOption } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelPropsType, StepLabelResultType, StepLabelType } from "../types/StepLabelType"
import GameStorageManager from "./StorageManager"
import GameWindowManager from "./WindowManager"

type AllOpenedLabelsType = { [key: LabelIdType]: number }
type AllChoicesMadeType = { label: LabelIdType, step: number, choice: number }

/**
 * GameStepManager is a class that manages the steps and labels of the game.
 */
export default class GameStepManager {
    private constructor() { }
    private static _stepsHistory: IHistoryStep[] = []
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    static get stepsHistory() {
        return GameStepManager._stepsHistory
    }
    /**
     * is a list of all labels that have been opened during the progression of the steps.
     * the key is the label id and the biggest step opened.
     */
    private static get allOpenedLabels() {
        return GameStorageManager.getVariable<AllOpenedLabelsType>(GameStorageManager.keysSystem.ALL_OPENED_LABELS_KEY) || {}
    }
    private static set allOpenedLabels(value: AllOpenedLabelsType) {
        GameStorageManager.setVariable(GameStorageManager.keysSystem.ALL_OPENED_LABELS_KEY, value)
    }
    /**
     * is a list of all choices made by the player during the progression of the steps.
     */
    private static get allChoicesMade() {
        return GameStorageManager.getVariable<AllChoicesMadeType[]>(GameStorageManager.keysSystem.ALL_CHOICES_MADE_KEY) || []
    }
    private static set allChoicesMade(value: AllChoicesMadeType[]) {
        GameStorageManager.setVariable(GameStorageManager.keysSystem.ALL_CHOICES_MADE_KEY, value)
    }
    private static _lastStepIndex: number = 0
    /**
     * lastStepIndex is the last step index that occurred during the progression of the steps. **Not is the length of the stepsHistory - 1.**
     */
    static get lastStepIndex() {
        return GameStepManager._lastStepIndex
    }
    /**
     * Increase the last step index that occurred during the progression of the steps.
     */
    private static increaseLastStepIndex() {
        GameStepManager._lastStepIndex++
    }
    private static _openedLabels: IOpenedLabel[] = []
    static get openedLabels() {
        return GameStepManager._openedLabels
    }
    /**
     * currentLabelId is the current label id that occurred during the progression of the steps.
     */
    private static get currentLabelId(): LabelIdType | undefined {
        if (GameStepManager._openedLabels.length > 0) {
            let item = GameStepManager._openedLabels[GameStepManager._openedLabels.length - 1]
            return item.label
        }
        return undefined
    }
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    static get currentLabel(): Label | undefined {
        if (GameStepManager.currentLabelId) {
            return getLabelById(GameStepManager.currentLabelId)
        }
    }
    private static get currentLabelStepIndex(): number | null {
        if (GameStepManager._openedLabels.length > 0) {
            let item = GameStepManager._openedLabels[GameStepManager._openedLabels.length - 1]
            return item.currentStepIndex
        }
        return null
    }
    /**
     * lastHistoryStep is the last history step that occurred during the progression of the steps.
     */
    private static get lastHistoryStep(): IHistoryStep | null {
        if (GameStepManager._stepsHistory.length > 0) {
            return GameStepManager._stepsHistory[GameStepManager._stepsHistory.length - 1]
        }
        return null
    }
    private static _originalStepData: IHistoryStepData | undefined = undefined
    private static get originalStepData(): IHistoryStepData {
        if (!GameStepManager._originalStepData) {
            return {
                path: "",
                storage: {},
                canvas: {
                    childrenTagsOrder: [],
                    currentElements: {},
                    currentTickers: {},
                    currentTickersSteps: {},
                },
                labelIndex: -1,
                openedLabels: [],
            }
        }
        return createExportableElement(GameStepManager._originalStepData)
    }
    private static set originalStepData(value: IHistoryStepData) {
        GameStepManager._originalStepData = createExportableElement(value)
    }

    private static get currentStepData(): IHistoryStepData {
        let currentStepData: IHistoryStepData = {
            path: window.location.pathname,
            storage: GameStorageManager.export(),
            canvas: GameWindowManager.export(),
            labelIndex: GameStepManager.currentLabelStepIndex || 0,
            openedLabels: createExportableElement(GameStepManager._openedLabels),
        }
        return currentStepData
    }

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    private static addStepHistory(step: StepLabelType<any>, choiseMade?: number) {
        let stepHistory: StepHistoryDataType = getStepSha1(step)
        let currentStepData: IHistoryStepData = GameStepManager.currentStepData
        if (GameStepManager.originalStepData) {
            if (GameStepManager.originalStepData.openedLabels.length === currentStepData.openedLabels.length) {
                try {
                    let lastStepDataOpenedLabelsString = JSON.stringify(GameStepManager.originalStepData.openedLabels)
                    let historyStepOpenedLabelsString = JSON.stringify(currentStepData.openedLabels)
                    if (
                        lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                        GameStepManager.originalStepData.path === currentStepData.path &&
                        GameStepManager.originalStepData.labelIndex === currentStepData.labelIndex
                    ) {
                        return
                    }
                }
                catch (e) {
                    console.error("[Pixi'VN] Error comparing openedLabels", e)
                }
            }
        }
        let data = diff(GameStepManager.originalStepData, currentStepData)
        if (data) {
            let dialoge: DialogueBaseModel | undefined = undefined
            let requiredChoices: IStoratedChoiceMenuOption[] | undefined = undefined
            if (GameStorageManager.getVariable<number>(GameStorageManager.keysSystem.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY) === GameStepManager.lastStepIndex) {
                dialoge = getDialogue()
            }
            if (GameStorageManager.getVariable<number>(GameStorageManager.keysSystem.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY) === GameStepManager.lastStepIndex) {
                requiredChoices = GameStorageManager.getVariable<IStoratedChoiceMenuOption[]>(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
            }
            GameStepManager._stepsHistory.push({
                diff: data,
                currentLabel: GameStepManager.currentLabelId,
                dialoge: dialoge,
                choices: requiredChoices,
                stepSha1: stepHistory,
                index: GameStepManager.lastStepIndex,
                choiceIndexMade: choiseMade
            })
            GameStepManager.originalStepData = currentStepData
        }
        GameStepManager.increaseLastStepIndex()
    }
    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     * @param stepIndex The step index of the label.
     * @param choiseMade The index of the choise made by the player. (This params is used in the choice menu)
     */
    private static addLabelHistory(label: LabelIdType, stepIndex: number, choiseMade?: number) {
        let allOpenedLabels = GameStepManager.allOpenedLabels
        let oldStepIndex = GameStepManager.allOpenedLabels[label]
        if (!oldStepIndex || oldStepIndex < stepIndex) {
            allOpenedLabels[label] = stepIndex
            GameStepManager.allOpenedLabels = allOpenedLabels
        }

        if (choiseMade !== undefined) {
            let allChoicesMade = GameStepManager.allChoicesMade
            let alredyMade = allChoicesMade.find((item) => item.label === label && item.step === stepIndex && item.choice === choiseMade)
            if (!alredyMade) {
                allChoicesMade.push({ label: label, step: stepIndex, choice: choiseMade })
                GameStepManager.allChoicesMade = allChoicesMade
            }
        }
    }
    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    private static pushNewLabel(label: LabelIdType) {
        let currentLabel = getLabelById(label)
        if (!currentLabel) {
            throw new Error(`[Pixi'VN] Label ${label} not found`)
        }
        GameStepManager._openedLabels.push({
            label: label,
            currentStepIndex: 0,
        })
    }
    /**
     * Close the current label and add it to the history.
     * @returns 
     */
    static closeCurrentLabel() {
        if (!GameStepManager.currentLabelId) {
            console.warn("[Pixi'VN] No label to close")
            return
        }
        if (!GameStepManager.currentLabel) {
            console.error("[Pixi'VN] currentLabel not found")
            return
        }
        GameStepManager._openedLabels.pop()
    }
    /**
     * Close all labels and add them to the history. **Attention: This method can cause an unhandled game ending.**
     */
    static closeAllLabels() {
        while (GameStepManager._openedLabels.length > 0) {
            GameStepManager.closeCurrentLabel()
        }
    }
    /**
     * Increase the current step index of the current label.
     */
    private static increaseCurrentStepIndex() {
        let item = GameStepManager._openedLabels[GameStepManager._openedLabels.length - 1]
        GameStepManager._openedLabels[GameStepManager._openedLabels.length - 1] = {
            ...item,
            currentStepIndex: item.currentStepIndex + 1,
        }
    }
    private static restoreLastLabelList() {
        GameStepManager._openedLabels = GameStepManager.originalStepData.openedLabels
    }
    /**
     * Get the narrative history
     * @returns the history of the dialogues, choices and steps
     */
    static getNarrativeHistory<T extends DialogueBaseModel = DialogueBaseModel>(): NarrativeHistory<T>[] {
        let list: NarrativeHistory<T>[] = []
        GameStepManager.stepsHistory.forEach((step) => {
            let dialoge = step.dialoge
            let requiredChoices = step.choices
            if (
                list.length > 0 &&
                list[list.length - 1].choices &&
                !list[list.length - 1].playerMadeChoice &&
                step.currentLabel
            ) {
                let oldChoices = list[list.length - 1].choices
                if (oldChoices) {
                    let choiceMade = false
                    if (step.choiceIndexMade !== undefined && oldChoices.length > step.choiceIndexMade) {
                        oldChoices[step.choiceIndexMade].isResponse = true
                        choiceMade = true
                    }
                    list[list.length - 1].playerMadeChoice = choiceMade
                    list[list.length - 1].choices = oldChoices
                }
            }
            if (dialoge || requiredChoices) {
                let choices: HistoryChoiceMenuOption[] | undefined = requiredChoices?.map((choice) => {
                    return {
                        text: choice.text,
                        type: choice.type,
                        isResponse: false
                    }
                })
                list.push({
                    dialoge: dialoge as T,
                    playerMadeChoice: false,
                    choices: choices,
                    stepIndex: step.index
                })
            }
        })
        return list
    }
    /**
     * Delete the narrative history.
     * @param itemsNumber The number of items to delete. If undefined, all items will be deleted.
     */
    removeNarrativeHistory(itemsNumber?: number) {
        if (itemsNumber) {
            // remove the first items
            GameStepManager._stepsHistory.splice(0, itemsNumber)
        }
        else {
            GameStepManager._stepsHistory = []
        }
    }
    /**
     * Check if the label is already completed.
     * @param label The label to check.
     * @returns True if the label is already completed.
     */
    public static isLabelAlreadyCompleted<Label extends LabelAbstract<any>>(label: LabelIdType | Label): boolean {
        let labelId: LabelIdType
        if (typeof label === 'string') {
            labelId = label
        }
        else {
            labelId = label.id
        }
        let allOpenedLabels = GameStepManager.allOpenedLabels
        let lastStep = allOpenedLabels[labelId]
        if (lastStep) {
            let currentLabel = getLabelById(labelId)
            if (currentLabel) {
                return currentLabel.steps.length <= lastStep
            }
        }
        return false
    }
    /**
     * Get the choices already made in the current step.
     * @returns The choices already made in the current step. If there are no choices, it will return undefined.
     */
    public static getAlreadyCurrentStepMadeChoices(): number[] | undefined {
        let choiceMenuOptions = getChoiceMenuOptions()
        if (choiceMenuOptions) {
            let alreadyMade: number[] = []
            choiceMenuOptions.forEach((item, index) => {
                let alreadyMadeChoice = GameStepManager.allChoicesMade.find((choice) => choice.label === item.label.id && choice.step === GameStepManager.currentLabelStepIndex)
                if (alreadyMadeChoice) {
                    alreadyMade.push(index)
                }
            })
            return alreadyMade
        }
        else {
            console.warn("[Pixi'VN] No choice menu options on current step")
        }
    }
    /**
     * Check if the current step is already completed.
     * @returns True if the current step is already completed.
     */
    public static currentStepLabelIsAlreadyOpened() {
        let currentLabel = GameStepManager.currentLabelId
        if (currentLabel) {
            let lastStep = GameStepManager.allOpenedLabels[currentLabel]
            if (lastStep === GameStepManager.currentLabelStepIndex) {
                return true
            }
        }
        return false
    }

    /* Run Methods */

    static get canGoNext(): boolean {
        let options = getChoiceMenuOptions()
        if (options && options.length > 0) {
            return false
        }
        if (GameStepManager._stepsHistory.length === 0) {
            return false
        }
        return true
    }
    /**
     * Execute the next step and add it to the history.
     * @param props The props to pass to the step.
     * @param choiseMade The index of the choise made by the player. (This params is used in the choice menu)
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     *     function nextOnClick() {
     *     setLoading(true)
     *     GameStepManager.goNext(yourParams)
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
    public static async goNext(props: StepLabelPropsType, choiseMade?: number): Promise<StepLabelResultType> {
        if (!GameStepManager.canGoNext) {
            console.warn("[Pixi'VN] The player must make a choice")
            return
        }
        if (GameStepManager.currentLabel && GameStepManager.currentLabel.onStepEnd) {
            await GameStepManager.currentLabel.onStepEnd(GameStepManager.currentLabelStepIndex || 0, GameStepManager.currentLabel)
        }
        GameStepManager.increaseCurrentStepIndex()
        return await GameStepManager.runCurrentStep(props, choiseMade)
    }
    /**
     * Execute the current step and add it to the history.
     * @param props The props to pass to the step.
     * @param choiseMade The choise made by the player.
     * @returns StepLabelResultType or undefined.
     */
    private static async runCurrentStep<T extends {}>(props: StepLabelPropsType<T>, choiseMade?: number): Promise<StepLabelResultType> {
        if (GameStepManager.currentLabelId) {
            let currentLabelStepIndex = GameStepManager.currentLabelStepIndex
            if (currentLabelStepIndex === null) {
                console.error("[Pixi'VN] currentLabelStepIndex is null")
                return
            }
            let currentLabel = GameStepManager.currentLabel as Label<T> | undefined
            if (!currentLabel) {
                console.error("[Pixi'VN] currentLabel not found")
                return
            }
            if (currentLabel.steps.length > currentLabelStepIndex) {
                let onStepRun = currentLabel.onStepStart
                if (onStepRun) {
                    await onStepRun(currentLabelStepIndex, currentLabel)
                }
                let step = currentLabel.steps[currentLabelStepIndex]
                let result = await step(props)
                GameStepManager.addLabelHistory(currentLabel.id, currentLabelStepIndex, choiseMade)
                GameStepManager.addStepHistory(step, choiseMade)
                return result
            }
            else if (GameStepManager.openedLabels.length > 1) {
                GameStepManager.closeCurrentLabel()
                return await GameStepManager.goNext(props, choiseMade)
            }
            else {
                GameStepManager.restoreLastLabelList()
                if (GameStepManager.gameEnd) {
                    return await GameStepManager.gameEnd(props)
                }
                console.error("[Pixi'VN] The end of the game is not managed, so the game is blocked. Read this documentation to know how to manage the end of the game: https://pixi-vn.web.app/start/labels.html#how-manage-the-end-of-the-game")
                return
            }
        }
    }
    /**
     * Execute the label and add it to the history. (It's similar to Ren'Py's call function)
     * @param label The label to execute or the id of the label
     * @param props The props to pass to the label.
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * GameStepManager.callLabel(startLabel, yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     * @example
     * ```typescript
     * // if you use it in a step label you should return the result.
     * return GameStepManager.callLabel(startLabel).then((result) => {
     *     return result
     * })
     * ```
     */
    public static async callLabel<T extends {} = {}>(label: Label<T> | LabelIdType, props: StepLabelPropsType<T>): Promise<StepLabelResultType> {
        let choiseMade: number | undefined = undefined
        let labelId: LabelIdType
        if (typeof label === 'string') {
            labelId = label
        }
        else {
            labelId = label.id
            if (typeof label.choiseIndex === "number") {
                choiseMade = label.choiseIndex
            }
        }
        try {
            if (labelId === CLOSE_LABEL_ID) {
                let closeCurrentLabel = newCloseLabel<T>(choiseMade)
                let choice: ChoiceMenuOptionClose<T> = {
                    label: closeCurrentLabel,
                    text: "",
                    closeCurrentLabel: false,
                    type: "close",
                    props: {},
                }
                return GameStepManager.closeChoiceMenu(choice, props)
            }
            let tempLabel = getLabelById<Label<T>>(labelId)
            if (!tempLabel) {
                throw new Error(`[Pixi'VN] Label ${labelId} not found`)
            }

            if (GameStepManager.currentLabel && GameStepManager.currentLabel.onStepEnd) {
                await GameStepManager.currentLabel.onStepEnd(GameStepManager.currentLabelStepIndex || 0, GameStepManager.currentLabel)
            }
            GameStepManager.pushNewLabel(tempLabel.id)
        }
        catch (e) {
            console.error("[Pixi'VN] Error calling label", e)
            return
        }
        return await GameStepManager.runCurrentStep<T>(props, choiseMade)
    }
    /**
     * Execute the label, close the current label, execute the new label and add the new label to the history. (It's similar to Ren'Py's jump function)
     * @param label The label to execute.
     * @param props The props to pass to the label or the id of the label
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * GameStepManager.jumpLabel(startLabel, yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     * @example
     * ```typescript
     * // if you use it in a step label you should return the result.
     * return GameStepManager.jumpLabel(startLabel).then((result) => {
     *     return result
     * })
     * ```
     */
    public static async jumpLabel<T extends {}>(label: Label<T> | LabelIdType, props: StepLabelPropsType<T>): Promise<StepLabelResultType> {
        GameStepManager.closeCurrentLabel()
        let choiseMade: number | undefined = undefined
        let labelId: LabelIdType
        if (typeof label === 'string') {
            labelId = label
        }
        else {
            labelId = label.id
            if (typeof label.choiseIndex === "number") {
                choiseMade = label.choiseIndex
            }
        }
        try {
            if (labelId === CLOSE_LABEL_ID) {
                let closeCurrentLabel = newCloseLabel<T>(choiseMade)
                let choice: ChoiceMenuOptionClose<T> = {
                    label: closeCurrentLabel,
                    text: "",
                    closeCurrentLabel: false,
                    type: "close",
                    props: {},
                }
                return GameStepManager.closeChoiceMenu<T>(choice, props)
            }
            let tempLabel = getLabelById<Label<T>>(labelId)
            if (!tempLabel) {
                throw new Error(`[Pixi'VN] Label ${labelId} not found`)
            }

            if (GameStepManager.currentLabel && GameStepManager.currentLabel.onStepEnd) {
                await GameStepManager.currentLabel.onStepEnd(GameStepManager.currentLabelStepIndex || 0, GameStepManager.currentLabel)
            }
            GameStepManager.pushNewLabel(tempLabel.id)
        }
        catch (e) {
            console.error("[Pixi'VN] Error jumping label", e)
            return
        }
        return await GameStepManager.runCurrentStep<T>(props, choiseMade)
    }
    /**
     * When the player is in a choice menu, can use this function to exit to the choice menu.
     * @param choice
     * @param props
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     * GameStepManager.closeChoiceMenu(yourParams).then((result) => {
     *     if (result) {
     *         // your code
     *     }
     * })
     * ```
     */
    public static async closeChoiceMenu<T extends {} = {}>(choice: ChoiceMenuOptionClose<T>, props: StepLabelPropsType<T>): Promise<StepLabelResultType> {
        let label: Label<T> = choice.label
        let choiseMade: number | undefined = undefined
        if (typeof label.choiseIndex === "number") {
            choiseMade = label.choiseIndex
        }
        if (choice.closeCurrentLabel) {
            GameStepManager.closeCurrentLabel()
        }
        return GameStepManager.goNext(props, choiseMade)
    }

    /* Go Back & Refresh Methods */

    /**
     * Go back to the last step and add it to the history.
     * @param navigate The navigate function.
     * @param steps The number of steps to go back.
     * @returns 
     * @example
     * ```typescript
     * export function goBack(navigate: (path: string) => void, afterBack?: () => void) {
     *     GameStepManager.goBack(navigate)
     *     afterBack && afterBack()
     * }
     * ```
     */
    public static async goBack(navigate: (path: string) => void, steps: number = 1) {
        if (steps <= 0) {
            console.warn("[Pixi'VN] Steps must be greater than 0")
            return
        }
        if (GameStepManager._stepsHistory.length <= 1) {
            console.warn("[Pixi'VN] No steps to go back")
            return
        }
        let restoredStep = GameStepManager.goBackInternal(steps, GameStepManager.originalStepData)
        if (restoredStep) {
            GameStepManager._originalStepData = restoredStep
            GameStepManager._openedLabels = createExportableElement(restoredStep.openedLabels)
            if (GameStepManager.currentLabel && GameStepManager.currentLabel.onLoadStep) {
                await GameStepManager.currentLabel.onLoadStep(GameStepManager.currentLabelStepIndex || 0, GameStepManager.currentLabel)
            }
            GameStorageManager.import(createExportableElement(restoredStep.storage))
            GameWindowManager.import(createExportableElement(restoredStep.canvas))
            navigate(restoredStep.path)
        }
        else {
            console.error("[Pixi'VN] Error going back")
        }
    }
    private static goBackInternal(steps: number, restoredStep: IHistoryStepData): IHistoryStepData {
        if (steps <= 0) {
            return restoredStep
        }
        if (GameStepManager._stepsHistory.length == 0) {
            return restoredStep
        }
        let lastHistoryStep = GameStepManager.lastHistoryStep
        if (lastHistoryStep) {
            try {
                let result = restoreDeepDiffChanges(restoredStep, lastHistoryStep.diff)
                GameStepManager._lastStepIndex = lastHistoryStep.index
                GameStepManager._stepsHistory.pop()
                return GameStepManager.goBackInternal(steps - 1, result)
            }
            catch (e) {
                console.error("[Pixi'VN] Error applying diff", e)
                return restoredStep
            }
        }
        else {
            return restoredStep
        }
    }

    /**
     * Return true if it is possible to go back.
     */
    public static get canGoBack(): boolean {
        return GameStepManager._stepsHistory.length > 1
    }

    /**
     * Add a label to the history.
     */
    public static clear() {
        GameStepManager._stepsHistory = []
        GameStepManager._openedLabels = []
    }

    /* Export and Import Methods */

    /**
     * Export the history to a JSON string.
     * @returns The history in a JSON string.
     */
    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    /**
     * Export the history to an object.
     * @returns The history in an object.
     */
    public static export(): ExportedStep {
        return {
            stepsHistory: GameStepManager._stepsHistory,
            openedLabels: GameStepManager._openedLabels,
            lastStepIndex: GameStepManager._lastStepIndex,
            originalStepData: GameStepManager._originalStepData,
        }
    }
    /**
     * Import the history from a JSON string.
     * @param dataString The history in a JSON string.
     */
    public static async importJson(dataString: string) {
        await GameStepManager.import(JSON.parse(dataString))
    }
    /**
     * Import the history from an object.
     * @param data The history in an object.
     */
    public static async import(data: object) {
        GameStepManager.clear()
        try {
            if (data.hasOwnProperty("stepsHistory")) {
                GameStepManager._stepsHistory = (data as ExportedStep)["stepsHistory"]
            }
            else {
                console.warn("[Pixi'VN] Could not import stepsHistory data, so will be ignored")
            }
            if (data.hasOwnProperty("openedLabels")) {
                GameStepManager._openedLabels = (data as ExportedStep)["openedLabels"]
            }
            else {
                console.warn("[Pixi'VN] Could not import openedLabels data, so will be ignored")
            }
            if (data.hasOwnProperty("lastStepIndex")) {
                GameStepManager._lastStepIndex = (data as ExportedStep)["lastStepIndex"]
            }
            else {
                console.warn("[Pixi'VN] Could not import lastStepIndex data, so will be ignored")
            }
            if (data.hasOwnProperty("originalStepData")) {
                GameStepManager._originalStepData = (data as ExportedStep)["originalStepData"]
            }
            else {
                console.warn("[Pixi'VN] Could not import originalStepData data, so will be ignored")
            }

            if (GameStepManager.currentLabel && GameStepManager.currentLabel.onLoadStep) {
                await GameStepManager.currentLabel.onLoadStep(GameStepManager.currentLabelStepIndex || 0, GameStepManager.currentLabel)
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }

    /**
     * Function to be executed at the end of the game. It should be set in the game initialization.
     * @example
     * ```typescript
     * GameStepManager.gameEnd = async (props) => {
     *    props.navigate("/end")
     * }
     * ```
     */
    static gameEnd: StepLabelType | undefined = undefined
}
