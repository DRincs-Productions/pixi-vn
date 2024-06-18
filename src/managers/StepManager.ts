import { diff } from "deep-diff"
import { DialogueBaseModel, Label } from "../classes"
import { IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption"
import newCloseLabel, { CLOSE_LABEL_ID } from "../classes/CloseLabel"
import { getLabelById } from "../decorators/LabelDecorator"
import { getDialogue } from "../functions"
import { restoreDeepDiffChanges } from "../functions/DiffUtility"
import { createExportableElement } from "../functions/ExportUtility"
import { getStepSha1 } from "../functions/StepLabelUtility"
import ExportedStep from "../interface/export/ExportedStep"
import IHistoryStep, { IHistoryStepData } from "../interface/IHistoryStep"
import IOpenedLabel from "../interface/IOpenedLabel"
import { LabelIdType } from "../types/LabelIdType"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelPropsType, StepLabelResultType, StepLabelType } from "../types/StepLabelType"
import GameStorageManager from "./StorageManager"
import GameWindowManager from "./WindowManager"

/**
 * GameStepManager is a class that manages the steps and labels of the game.
 */
export default class GameStepManager {
    private constructor() { }
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    private static _stepsHistory: IHistoryStep[] = []
    static get stepsHistory() {
        return GameStepManager._stepsHistory
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
                    currentTickers: [],
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

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    private static addStepHistory(step: StepLabelType<any>, choiseMade?: number) {
        let stepHistory: StepHistoryDataType = getStepSha1(step)
        let historyStep: IHistoryStepData = {
            path: window.location.pathname,
            storage: GameStorageManager.export(),
            canvas: GameWindowManager.export(),
            labelIndex: GameStepManager.currentLabelStepIndex || 0,
            openedLabels: createExportableElement(GameStepManager._openedLabels),
        }
        if (GameStepManager.originalStepData) {
            if (GameStepManager.originalStepData.openedLabels.length === historyStep.openedLabels.length) {
                try {
                    let lastStepDataOpenedLabelsString = JSON.stringify(GameStepManager.originalStepData.openedLabels)
                    let historyStepOpenedLabelsString = JSON.stringify(historyStep.openedLabels)
                    if (
                        lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                        GameStepManager.originalStepData.path === historyStep.path &&
                        GameStepManager.originalStepData.labelIndex === historyStep.labelIndex
                    ) {
                        return
                    }
                }
                catch (e) {
                    console.error("[Pixi'VN] Error comparing openedLabels", e)
                }
            }
        }
        let data = diff(GameStepManager.originalStepData, historyStep)
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
            GameStepManager.originalStepData = historyStep
        }
        GameStepManager.increaseLastStepIndex()
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
     * Close all labels and add them to the history.
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
    private static restorLastLabelList() {
        GameStepManager._openedLabels = GameStepManager.originalStepData.openedLabels
    }

    /* Run Methods */

    /**
     * Execute the next step and add it to the history.
     * @param props The props to pass to the step.
     * @param choiseMade The index of the choise made by the player. (This params is used in the choice menu)
     * @returns StepLabelResultType or undefined.
     * @example
     * ```typescript
     *     function nextOnClick() {
     *     setLoading(true)
     *     GameStepManager.runNextStep(yourParams)
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
    public static async runNextStep(props: StepLabelPropsType, choiseMade?: number): Promise<StepLabelResultType> {
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
                let step = currentLabel.steps[currentLabelStepIndex]
                let result = await step(props)
                GameStepManager.addStepHistory(step, choiseMade)
                return result
            }
            else if (GameStepManager.openedLabels.length > 1) {
                GameStepManager.closeCurrentLabel()
                return await GameStepManager.runNextStep(props, choiseMade)
            }
            else {
                GameStepManager.restorLastLabelList()
                console.error("[Pixi'VN] The end of the game is not managed, so the game is blocked. Read this documentation to know how to manage the end of the game: https://pixi-vn.web.app/start/labels.html#how-manage-the-end-of-the-game")
                return
            }
        }
    }
    /**
     * Execute the label and add it to the history.
     * Is a call function in Ren'Py.
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
                let closeLabel = newCloseLabel(choiseMade)
                return GameStepManager.closeChoiceMenu(closeLabel, props)
            }
            let tempLabel = getLabelById<Label<T>>(labelId)
            if (!tempLabel) {
                throw new Error(`[Pixi'VN] Label ${labelId} not found`)
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
     * Execute the label, close all labels and add them to the history.
     * Is a jump function in Ren'Py.
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
        GameStepManager.closeAllLabels()
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
                let closeLabel = newCloseLabel(choiseMade)
                return GameStepManager.closeChoiceMenu(closeLabel, props)
            }
            let tempLabel = getLabelById<Label<T>>(labelId)
            if (!tempLabel) {
                throw new Error(`[Pixi'VN] Label ${labelId} not found`)
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
     * @param props The props to pass to the step.
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
    public static async closeChoiceMenu<T extends {}>(label: Label<T>, props: StepLabelPropsType<T>): Promise<StepLabelResultType> {
        let choiseMade: number | undefined = undefined
        if (typeof label.choiseIndex === "number") {
            choiseMade = label.choiseIndex
        }
        return GameStepManager.runNextStep(props, choiseMade)
    }

    /* After Update Methods */

    // /**
    //  * After the update or code edit, some steps or labels may no longer match.
    //  * - In case of step mismatch, the game will be updated to the last matching step.
    //  * - In case of label mismatch, the game gives an error.
    //  * @returns 
    //  */
    // private static afterUpdate() {
    //     // TODO: implement
    //     if (!GameStepManager.currentLabel) {
    //         // TODO: implement
    //         return
    //     }
    //     let currentLabel = getLabelInstanceByClassName(GameStepManager.currentLabel)
    //     if (!currentLabel) {
    //         console.error("Label not found")
    //         return
    //     }
    //     let oldSteps = GameStepManager.stepsAfterLastHistoryLabel
    //     let currentStepIndex = currentLabel.getCorrespondingStepsNumber(oldSteps)
    //     let stepToRemove = oldSteps.length - currentStepIndex
    //     GameStepManager.removeLastHistoryNodes(stepToRemove)
    //     GameStepManager.loadLastStep()
    // }
    // private static loadLastStep() {
    //     // TODO: implement
    // }
    // /**
    //  * Remove a number of items from the last of the history.
    //  * @param itemNumber The number of items to remove from the last of the history.
    //  */
    // private static removeLastHistoryNodes(itemNumber: number) {
    //     // TODO: implement
    //     for (let i = 0; i < itemNumber; i++) {
    //         GameStepManager._stepsHistory.pop()
    //     }
    // }
    // /**
    //  * stepsAfterLastHistoryLabel is a list of steps that occurred after the last history label.
    //  */
    // private static get stepsAfterLastHistoryLabel(): StepHistoryDataType[] {
    //     let length = GameStepManager._stepsHistory.length
    //     let steps: StepHistoryDataType[] = []
    //     for (let i = length - 1; i >= 0; i--) {
    //         let element = GameStepManager._stepsHistory[i]
    //         if (typeof element === "object" && "stepSha1" in element) {
    //             steps.push(element.stepSha1)
    //         }
    //         else {
    //             break
    //         }
    //     }

    //     steps = steps.reverse()
    //     return steps
    // }

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
    public static goBack(navigate: (path: string) => void, steps: number = 1) {
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
    public static importJson(dataString: string) {
        GameStepManager.import(JSON.parse(dataString))
    }
    /**
     * Import the history from an object.
     * @param data The history in an object.
     */
    public static import(data: object) {
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
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
