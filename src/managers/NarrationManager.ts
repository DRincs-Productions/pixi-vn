import { diff } from "deep-diff"
import { canvas, sound, storage } from "."
import { Dialogue, Label } from "../classes"
import ChoiceMenuOption, { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption"
import newCloseLabel, { CLOSE_LABEL_ID } from "../classes/CloseLabel"
import LabelAbstract from "../classes/LabelAbstract"
import { getLabelById } from "../decorators/LabelDecorator"
import { getFlag, setFlag } from "../functions"
import { restoreDeepDiffChanges } from "../functions/DiffUtility"
import { createExportableElement } from "../functions/ExportUtility"
import { CharacterInterface, NarrativeHistory } from "../interface"
import ExportedStep from "../interface/export/ExportedStep"
import IHistoryStep, { IHistoryStepData } from "../interface/IHistoryStep"
import IOpenedLabel from "../interface/IOpenedLabel"
import { ChoiceMenuOptionsType, Close, DialogueType, HistoryChoiceMenuOption } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import { StepLabelPropsType, StepLabelResultType, StepLabelType } from "../types/StepLabelType"

type AllOpenedLabelsType = { [key: LabelIdType]: { biggestStep: number, openCount: number } }
type AllChoicesMadeType = { label: LabelIdType, step: number, choice: number, stepSha1: string }
type CurrentStepTimesCounterMemoty = { [key: LabelIdType]: { [key: number]: { lastStepIndexs: number[], stepSha1: string } } }

/**
 * This class is a class that manages the steps and labels of the game.
 */
export default class NarrationManager {
    private constructor() { }
    private static _stepsHistory: IHistoryStep[] = []
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    static get stepsHistory() {
        return NarrationManager._stepsHistory
    }
    /**
     * is a list of all labels that have been opened during the progression of the steps.
     * the key is the label id and the biggest step opened.
     */
    private static get allOpenedLabels() {
        return storage.getVariable<AllOpenedLabelsType>(storage.keysSystem.OPENED_LABELS_COUNTER_KEY) || {}
    }
    private static set allOpenedLabels(value: AllOpenedLabelsType) {
        storage.setVariable(storage.keysSystem.OPENED_LABELS_COUNTER_KEY, value)
    }
    /**
     * Counter of execution times of the current step. Current execution is also included.
     * **Attention**: if the step index is edited or the code of step is edited, the counter will be reset.
     * You can restart the counter in this way:
     * ```typescript
     * narration.currentStepTimesCounter = 0
     * ```
     */
    static get currentStepTimesCounter(): number {
        let lastStep = NarrationManager.lastStepIndex
        let currentLabelStepIndex = NarrationManager.currentLabelStepIndex
        let labelId = NarrationManager.currentLabelId
        let currentLabel = NarrationManager.currentLabel
        if (!labelId || currentLabelStepIndex === null || !currentLabel) {
            console.error("[Pixi'VN] currentLabelId or currentLabelStepIndex is null or currentLabel not found")
            return 0
        }
        let stepSha1 = currentLabel.getStepSha1(currentLabelStepIndex) || "error"
        let obj = storage.getVariable<CurrentStepTimesCounterMemoty>(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY) || {}
        if (!obj[labelId]) {
            obj[labelId] = {}
        }
        if (!obj[labelId][currentLabelStepIndex] || obj[labelId][currentLabelStepIndex].stepSha1 != stepSha1) {
            obj[labelId][currentLabelStepIndex] = { lastStepIndexs: [], stepSha1: stepSha1 }
        }
        let list = obj[labelId][currentLabelStepIndex].lastStepIndexs
        let listContainLastStep = list.find((item) => item === lastStep)
        if (!listContainLastStep) {
            list.push(lastStep)
            obj[labelId][currentLabelStepIndex].lastStepIndexs = list
            storage.setVariable(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY, obj)
        }
        return list.length
    }
    static set currentStepTimesCounter(_: 0) {
        let currentLabelStepIndex = NarrationManager.currentLabelStepIndex
        let labelId = NarrationManager.currentLabelId
        if (!labelId || currentLabelStepIndex === null) {
            console.error("[Pixi'VN] currentLabelId or currentLabelStepIndex is null")
            return
        }
        let obj = storage.getVariable<CurrentStepTimesCounterMemoty>(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY) || {}
        if (!obj[labelId]) {
            obj[labelId] = {}
        }
        obj[labelId][currentLabelStepIndex] = { lastStepIndexs: [], stepSha1: "" }
        storage.setVariable(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY, obj)
    }
    /**
     * is a list of all choices made by the player during the progression of the steps.
     */
    private static get allChoicesMade() {
        return storage.getVariable<AllChoicesMadeType[]>(storage.keysSystem.ALL_CHOICES_MADE_KEY) || []
    }
    private static set allChoicesMade(value: AllChoicesMadeType[]) {
        storage.setVariable(storage.keysSystem.ALL_CHOICES_MADE_KEY, value)
    }
    private static _lastStepIndex: number = 0
    /**
     * lastStepIndex is the last step index that occurred during the progression of the steps. **Not is the length of the stepsHistory - 1.**
     */
    static get lastStepIndex() {
        return NarrationManager._lastStepIndex
    }
    /**
     * Increase the last step index that occurred during the progression of the steps.
     */
    private static increaseLastStepIndex() {
        NarrationManager._lastStepIndex++
    }
    private static _openedLabels: IOpenedLabel[] = []
    static get openedLabels() {
        return NarrationManager._openedLabels
    }
    /**
     * currentLabelId is the current label id that occurred during the progression of the steps.
     */
    private static get currentLabelId(): LabelIdType | undefined {
        if (NarrationManager._openedLabels.length > 0) {
            let item = NarrationManager._openedLabels[NarrationManager._openedLabels.length - 1]
            return item.label
        }
        return undefined
    }
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    static get currentLabel(): Label | undefined {
        if (NarrationManager.currentLabelId) {
            return getLabelById(NarrationManager.currentLabelId)
        }
    }
    private static get currentLabelStepIndex(): number | null {
        if (NarrationManager._openedLabels.length > 0) {
            let item = NarrationManager._openedLabels[NarrationManager._openedLabels.length - 1]
            return item.currentStepIndex
        }
        return null
    }
    /**
     * lastHistoryStep is the last history step that occurred during the progression of the steps.
     */
    private static get lastHistoryStep(): IHistoryStep | null {
        if (NarrationManager._stepsHistory.length > 0) {
            return NarrationManager._stepsHistory[NarrationManager._stepsHistory.length - 1]
        }
        return null
    }
    private static _originalStepData: IHistoryStepData | undefined = undefined
    private static get originalStepData(): IHistoryStepData {
        if (!NarrationManager._originalStepData) {
            return {
                path: "",
                storage: {},
                canvas: {
                    elementAliasesOrder: [],
                    elements: {},
                    tickers: {},
                    tickersSteps: {},
                },
                sound: {
                    soundAliasesOrder: [],
                    sounds: {},
                    playInStepIndex: {},
                },
                labelIndex: -1,
                openedLabels: [],
            }
        }
        return createExportableElement(NarrationManager._originalStepData)
    }
    private static set originalStepData(value: IHistoryStepData) {
        NarrationManager._originalStepData = createExportableElement(value)
    }

    private static get currentStepData(): IHistoryStepData {
        let currentStepData: IHistoryStepData = {
            path: window.location.pathname,
            storage: storage.export(),
            canvas: canvas.export(),
            sound: sound.removeOldSoundAndExport(),
            labelIndex: NarrationManager.currentLabelStepIndex || 0,
            openedLabels: createExportableElement(NarrationManager._openedLabels),
        }
        return currentStepData
    }

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    private static addStepHistory(stepSha: string, choiseMade?: number) {
        let currentStepData: IHistoryStepData = NarrationManager.currentStepData
        if (NarrationManager.originalStepData) {
            if (NarrationManager.originalStepData.openedLabels.length === currentStepData.openedLabels.length) {
                try {
                    let lastStepDataOpenedLabelsString = JSON.stringify(NarrationManager.originalStepData.openedLabels)
                    let historyStepOpenedLabelsString = JSON.stringify(currentStepData.openedLabels)
                    if (
                        lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                        NarrationManager.originalStepData.path === currentStepData.path &&
                        NarrationManager.originalStepData.labelIndex === currentStepData.labelIndex
                    ) {
                        return
                    }
                }
                catch (e) {
                    console.error("[Pixi'VN] Error comparing openedLabels", e)
                }
            }
        }
        let data = diff(NarrationManager.originalStepData, currentStepData)
        if (data) {
            let dialoge: Dialogue | undefined = undefined
            let requiredChoices: IStoratedChoiceMenuOption[] | undefined = undefined
            if (storage.getVariable<number>(storage.keysSystem.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY) === NarrationManager.lastStepIndex) {
                dialoge = NarrationManager.dialogue
            }
            if (storage.getVariable<number>(storage.keysSystem.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY) === NarrationManager.lastStepIndex) {
                requiredChoices = storage.getVariable<IStoratedChoiceMenuOption[]>(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
            }
            NarrationManager._stepsHistory.push({
                diff: data,
                currentLabel: NarrationManager.currentLabelId,
                dialoge: dialoge,
                choices: requiredChoices,
                stepSha1: stepSha,
                index: NarrationManager.lastStepIndex,
                choiceIndexMade: choiseMade
            })
            NarrationManager.originalStepData = currentStepData
        }
        NarrationManager.increaseLastStepIndex()
    }
    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     * @param stepIndex The step index of the label.
     * @param choiseMade The index of the choise made by the player. (This params is used in the choice menu)
     */
    private static addLabelHistory(label: LabelIdType, stepIndex: number, stepSha: string, choiseMade?: number) {
        let allOpenedLabels = NarrationManager.allOpenedLabels
        let oldStepIndex = NarrationManager.allOpenedLabels[label]?.biggestStep || 0
        let openCount = NarrationManager.allOpenedLabels[label]?.openCount || 0
        if (!oldStepIndex || oldStepIndex < stepIndex) {
            allOpenedLabels[label] = { biggestStep: stepIndex, openCount: openCount }
            NarrationManager.allOpenedLabels = allOpenedLabels
        }

        if (choiseMade !== undefined) {
            let allChoicesMade = NarrationManager.allChoicesMade
            let alredyMade = allChoicesMade.find((item) => item.label === label && item.step === stepIndex && item.choice === choiseMade)
            if (!alredyMade) {
                allChoicesMade.push({ label: label, step: stepIndex, choice: choiseMade, stepSha1: stepSha })
                NarrationManager.allChoicesMade = allChoicesMade
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
        NarrationManager._openedLabels.push({
            label: label,
            currentStepIndex: 0,
        })
        let allOpenedLabels = NarrationManager.allOpenedLabels
        let biggestStep = NarrationManager.allOpenedLabels[label]?.biggestStep || 0
        let openCount = NarrationManager.allOpenedLabels[label]?.openCount || 0
        allOpenedLabels[label] = { biggestStep: biggestStep, openCount: openCount + 1 }
        NarrationManager.allOpenedLabels = allOpenedLabels
    }
    /**
     * Close the current label and add it to the history.
     * @returns 
     */
    static closeCurrentLabel() {
        if (!NarrationManager.currentLabelId) {
            console.warn("[Pixi'VN] No label to close")
            return
        }
        if (!NarrationManager.currentLabel) {
            console.error("[Pixi'VN] currentLabel not found")
            return
        }
        NarrationManager._openedLabels.pop()
    }
    /**
     * Close all labels and add them to the history. **Attention: This method can cause an unhandled game ending.**
     */
    static closeAllLabels() {
        while (NarrationManager._openedLabels.length > 0) {
            NarrationManager.closeCurrentLabel()
        }
    }
    /**
     * Increase the current step index of the current label.
     */
    private static increaseCurrentStepIndex() {
        let item = NarrationManager._openedLabels[NarrationManager._openedLabels.length - 1]
        NarrationManager._openedLabels[NarrationManager._openedLabels.length - 1] = {
            ...item,
            currentStepIndex: item.currentStepIndex + 1,
        }
    }
    private static restoreLastLabelList() {
        NarrationManager._openedLabels = NarrationManager.originalStepData.openedLabels
    }
    /**
     * Get the narrative history
     * @returns the history of the dialogues, choices and steps
     */
    public static get narrativeHistory(): NarrativeHistory[] {
        let list: NarrativeHistory[] = []
        NarrationManager.stepsHistory.forEach((step) => {
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
                    dialoge: dialoge,
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
            NarrationManager._stepsHistory.splice(0, itemsNumber)
        }
        else {
            NarrationManager._stepsHistory = []
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
        let allOpenedLabels = NarrationManager.allOpenedLabels
        let lastStep = allOpenedLabels[labelId]?.biggestStep || 0
        if (lastStep) {
            let currentLabel = getLabelById(labelId)
            if (currentLabel) {
                return currentLabel.steps.length <= lastStep
            }
        }
        return false
    }
    /**
     * Check if the label is already started.
     * @param label The label to check.
     * @returns True if the label is already started.
     */
    public static isLabelAlreadyStarted<Label extends LabelAbstract<any>>(label: LabelIdType | Label): boolean {
        let labelId: LabelIdType
        if (typeof label === 'string') {
            labelId = label
        }
        else {
            labelId = label.id
        }
        let allOpenedLabels = NarrationManager.allOpenedLabels
        let lastStep = allOpenedLabels[labelId]
        return lastStep !== undefined
    }
    /**
     * Get the choices already made in the current step. **Attention**: if the choice step index is edited or the code of choice step is edited, the result will be wrong.
     * @returns The choices already made in the current step. If there are no choices, it will return undefined.
     */
    public static get alreadyCurrentStepMadeChoices(): number[] | undefined {
        let choiceMenuOptions = NarrationManager.choiceMenuOptions
        if (!choiceMenuOptions) {
            console.warn("[Pixi'VN] No choice menu options on current step")
            return
        }
        let currentLabelStepIndex = NarrationManager.currentLabelStepIndex
        let currentLabel = NarrationManager.currentLabel
        if (currentLabelStepIndex === null || !currentLabel) {
            console.error("[Pixi'VN] currentLabelStepIndex is null or currentLabel not found")
            return
        }
        let stepSha = currentLabel.getStepSha1(currentLabelStepIndex)
        if (!stepSha) {
            console.warn("[Pixi'VN] stepSha not found")
        }
        let alreadyMade: number[] = []
        choiceMenuOptions.forEach((item, index) => {
            let alreadyMadeChoice = NarrationManager.allChoicesMade.find((choice) =>
                choice.label === item.label.id &&
                choice.step === currentLabelStepIndex &&
                choice.stepSha1 === stepSha
            )
            if (alreadyMadeChoice) {
                alreadyMade.push(index)
            }
        })
        return alreadyMade
    }
    /**
     * Check if the current step is already completed.
     * @returns True if the current step is already completed.
     */
    public static get isCurrentStepAlreadyOpened(): boolean {
        let currentLabel = NarrationManager.currentLabelId
        if (currentLabel) {
            let lastStep = NarrationManager.allOpenedLabels[currentLabel]?.openCount || 0
            if (NarrationManager.currentLabelStepIndex && lastStep >= NarrationManager.currentLabelStepIndex) {
                return true
            }
        }
        return false
    }
    /**
     * Get times a label has been opened
     * @returns times a label has been opened
     */
    public static getTimesLabelOpened(label: LabelIdType): number {
        return NarrationManager.allOpenedLabels[label]?.openCount || 0
    }

    /* Run Methods */

    static get canGoNext(): boolean {
        let options = NarrationManager.choiceMenuOptions
        if (options && options.length > 0) {
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
    public static async goNext(props: StepLabelPropsType, choiseMade?: number): Promise<StepLabelResultType> {
        if (!NarrationManager.canGoNext) {
            console.warn("[Pixi'VN] The player must make a choice")
            return
        }
        if (NarrationManager.currentLabel && NarrationManager.currentLabel.onStepEnd) {
            await NarrationManager.currentLabel.onStepEnd(NarrationManager.currentLabelStepIndex || 0, NarrationManager.currentLabel)
        }
        NarrationManager.increaseCurrentStepIndex()
        return await NarrationManager.runCurrentStep(props, choiseMade)
    }
    /**
     * Execute the current step and add it to the history.
     * @param props The props to pass to the step.
     * @param choiseMade The choise made by the player.
     * @returns StepLabelResultType or undefined.
     */
    private static async runCurrentStep<T extends {}>(props: StepLabelPropsType<T>, choiseMade?: number): Promise<StepLabelResultType> {
        if (NarrationManager.currentLabelId) {
            let currentLabelStepIndex = NarrationManager.currentLabelStepIndex
            if (currentLabelStepIndex === null) {
                console.error("[Pixi'VN] currentLabelStepIndex is null")
                return
            }
            let currentLabel = NarrationManager.currentLabel as Label<T> | undefined
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
                let stepSha = currentLabel.getStepSha1(currentLabelStepIndex)
                if (!stepSha) {
                    console.warn("[Pixi'VN] stepSha not found")
                }
                try {
                    let result = await step(props)
                    NarrationManager.addLabelHistory(currentLabel.id, currentLabelStepIndex, stepSha || "error", choiseMade)
                    NarrationManager.addStepHistory(stepSha || "error", choiseMade)
                    return result
                }
                catch (e) {
                    // TODO: It might be useful to revert to the original state to avoid errors, but I don't have the browser to do that and I haven't asked for it yet.
                    // await GameStepManager.restoreFromHistoryStep(GameStepManager.originalStepData, navigate)
                    console.error("[Pixi'VN] Error running step", e)
                    if (NarrationManager.onStepError) {
                        NarrationManager.onStepError(e, props)
                    }
                    return
                }
            }
            else if (NarrationManager.openedLabels.length > 1) {
                NarrationManager.closeCurrentLabel()
                return await NarrationManager.goNext(props, choiseMade)
            }
            else {
                NarrationManager.restoreLastLabelList()
                if (NarrationManager.onGameEnd) {
                    return await NarrationManager.onGameEnd(props)
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
                    oneTime: false,
                    props: {},
                }
                return NarrationManager.closeChoiceMenu(choice, props)
            }
            let tempLabel = getLabelById<Label<T>>(labelId)
            if (!tempLabel) {
                throw new Error(`[Pixi'VN] Label ${labelId} not found`)
            }

            if (NarrationManager.currentLabel && NarrationManager.currentLabel.onStepEnd) {
                await NarrationManager.currentLabel.onStepEnd(NarrationManager.currentLabelStepIndex || 0, NarrationManager.currentLabel)
            }
            NarrationManager.pushNewLabel(tempLabel.id)
        }
        catch (e) {
            console.error("[Pixi'VN] Error calling label", e)
            return
        }
        return await NarrationManager.runCurrentStep<T>(props, choiseMade)
    }
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
    public static async jumpLabel<T extends {}>(label: Label<T> | LabelIdType, props: StepLabelPropsType<T>): Promise<StepLabelResultType> {
        NarrationManager.closeCurrentLabel()
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
                    oneTime: false,
                    props: {},
                }
                return NarrationManager.closeChoiceMenu<T>(choice, props)
            }
            let tempLabel = getLabelById<Label<T>>(labelId)
            if (!tempLabel) {
                throw new Error(`[Pixi'VN] Label ${labelId} not found`)
            }

            if (NarrationManager.currentLabel && NarrationManager.currentLabel.onStepEnd) {
                await NarrationManager.currentLabel.onStepEnd(NarrationManager.currentLabelStepIndex || 0, NarrationManager.currentLabel)
            }
            NarrationManager.pushNewLabel(tempLabel.id)
        }
        catch (e) {
            console.error("[Pixi'VN] Error jumping label", e)
            return
        }
        return await NarrationManager.runCurrentStep<T>(props, choiseMade)
    }
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
    public static async closeChoiceMenu<T extends {} = {}>(choice: ChoiceMenuOptionClose<T>, props: StepLabelPropsType<T>): Promise<StepLabelResultType> {
        let label: Label<T> = choice.label
        let choiseMade: number | undefined = undefined
        if (typeof label.choiseIndex === "number") {
            choiseMade = label.choiseIndex
        }
        if (choice.closeCurrentLabel) {
            NarrationManager.closeCurrentLabel()
        }
        return NarrationManager.goNext(props, choiseMade)
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
     *     narration.goBack(navigate)
     *     afterBack && afterBack()
     * }
     * ```
     */
    public static async goBack(navigate: (path: string) => void, steps: number = 1) {
        if (steps <= 0) {
            console.warn("[Pixi'VN] Steps must be greater than 0")
            return
        }
        if (NarrationManager._stepsHistory.length <= 1) {
            console.warn("[Pixi'VN] No steps to go back")
            return
        }
        let restoredStep = NarrationManager.goBackInternal(steps, NarrationManager.originalStepData)
        if (restoredStep) {
            await NarrationManager.restoreFromHistoryStep(restoredStep, navigate)
        }
        else {
            console.error("[Pixi'VN] Error going back")
        }
    }
    private static goBackInternal(steps: number, restoredStep: IHistoryStepData): IHistoryStepData {
        if (steps <= 0) {
            return restoredStep
        }
        if (NarrationManager._stepsHistory.length == 0) {
            return restoredStep
        }
        let lastHistoryStep = NarrationManager.lastHistoryStep
        if (lastHistoryStep) {
            try {
                let result = restoreDeepDiffChanges(restoredStep, lastHistoryStep.diff)
                NarrationManager._lastStepIndex = lastHistoryStep.index
                NarrationManager._stepsHistory.pop()
                return NarrationManager.goBackInternal(steps - 1, result)
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
    private static async restoreFromHistoryStep(restoredStep: IHistoryStepData, navigate: (path: string) => void) {
        NarrationManager._originalStepData = restoredStep
        NarrationManager._openedLabels = createExportableElement(restoredStep.openedLabels)
        if (NarrationManager.currentLabel && NarrationManager.currentLabel.onLoadStep) {
            await NarrationManager.currentLabel.onLoadStep(NarrationManager.currentLabelStepIndex || 0, NarrationManager.currentLabel)
        }
        storage.import(createExportableElement(restoredStep.storage))
        canvas.import(createExportableElement(restoredStep.canvas))
        sound.import(createExportableElement(restoredStep.sound), NarrationManager.lastStepIndex - 1)
        navigate(restoredStep.path)
    }

    /**
     * Return true if it is possible to go back.
     */
    public static get canGoBack(): boolean {
        return NarrationManager._stepsHistory.length > 1
    }



    /**
     * Function to be executed at the end of the game. It should be set in the game initialization.
     * @example
     * ```typescript
     * narration.onGameEnd = async (props) => {
     *    props.navigate("/end")
     * }
     * ```
     */
    public static onGameEnd: StepLabelType | undefined = undefined
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
    public static onStepError: ((error: any, props: StepLabelPropsType) => void) | undefined = undefined

    /**
     * Dialogue to be shown in the game
     */
    public static get dialogue(): Dialogue | undefined {
        return storage.getVariable<DialogueType>(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY) as Dialogue
    }
    public static set dialogue(props: {
        character: string | CharacterInterface,
        text: string | string[],
    } | string | string[] | Dialogue | undefined) {
        if (!props) {
            storage.setVariable(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, undefined)
            return
        }
        let text = ''
        let character: string | undefined = undefined
        let dialogue: Dialogue
        if (typeof props === 'string') {
            text = props
            dialogue = new Dialogue(text, character)
        }
        else if (Array.isArray(props)) {
            text = props.join()
            dialogue = new Dialogue(text, character)
        }
        else if (!(props instanceof Dialogue)) {
            if (Array.isArray(props.text)) {
                text = props.text.join()
            }
            else {
                text = props.text
            }
            if (props.character) {
                if (typeof props.character === 'string') {
                    character = props.character
                }
                else {
                    character = props.character.id
                }
            }
            dialogue = new Dialogue(text, character)
        }
        else {
            dialogue = props
        }

        if (getFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY)) {
            let glueDialogue = storage.getVariable<DialogueType>(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY) as Dialogue
            if (glueDialogue) {
                dialogue.text = `${glueDialogue.text}${dialogue.text}`
            }
            setFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, false)
        }

        storage.setVariable(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue as DialogueType)
        storage.setVariable(storage.keysSystem.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY, NarrationManager.lastStepIndex)
    }
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
    public static get choiceMenuOptions(): ChoiceMenuOptionsType<{ [key: string | number | symbol]: any }> | undefined {
        let d = storage.getVariable<IStoratedChoiceMenuOption[]>(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
        if (d) {
            let options: ChoiceMenuOptionsType = []
            d.forEach((option, index) => {
                if (option.type === Close) {
                    let itemLabel = newCloseLabel(index)
                    let choice = new ChoiceMenuOptionClose(option.text, {
                        closeCurrentLabel: option.closeCurrentLabel,
                        oneTime: option.oneTime
                    })
                    choice.label = itemLabel
                    options.push(choice)
                    return
                }
                let label = getLabelById(option.label)
                if (label) {
                    let itemLabel = new Label(label.id, label.steps, {
                        onStepStart: label.onStepStart,
                        choiseIndex: index
                    })
                    options.push(new ChoiceMenuOption(option.text, itemLabel, option.props, {
                        type: option.type,
                        oneTime: option.oneTime
                    }))
                }
            })
            return options
        }
        return undefined
    }
    public static set choiceMenuOptions(options: ChoiceMenuOptionsType<any> | undefined) {
        if (!options) {
            storage.setVariable(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined)
            return
        }
        options = options.filter((option, index) => {
            if (option.oneTime) {
                let alreadyChoices = NarrationManager.alreadyCurrentStepMadeChoices
                if (alreadyChoices && alreadyChoices.includes(index)) {
                    return false
                }
            }
            return true
        })
        let value: IStoratedChoiceMenuOption[] = options.map((option) => {
            if (option instanceof ChoiceMenuOptionClose) {
                return {
                    text: option.text,
                    type: Close,
                    closeCurrentLabel: option.closeCurrentLabel,
                    oneTime: option.oneTime,
                }
            }
            return {
                ...option,
                label: option.label.id,
            }
        })
        storage.setVariable(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, value)
        storage.setVariable(storage.keysSystem.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY, NarrationManager.lastStepIndex)
    }


    /**
     * Add a label to the history.
     */
    public static clear() {
        NarrationManager._stepsHistory = []
        NarrationManager._openedLabels = []
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
            stepsHistory: NarrationManager._stepsHistory,
            openedLabels: NarrationManager._openedLabels,
            lastStepIndex: NarrationManager._lastStepIndex,
            originalStepData: NarrationManager._originalStepData,
        }
    }
    /**
     * Import the history from a JSON string.
     * @param dataString The history in a JSON string.
     */
    public static async importJson(dataString: string) {
        await NarrationManager.import(JSON.parse(dataString))
    }
    /**
     * Import the history from an object.
     * @param data The history in an object.
     */
    public static async import(data: object) {
        NarrationManager.clear()
        try {
            if (data.hasOwnProperty("stepsHistory")) {
                NarrationManager._stepsHistory = (data as ExportedStep)["stepsHistory"]
            }
            else {
                console.warn("[Pixi'VN] Could not import stepsHistory data, so will be ignored")
            }
            if (data.hasOwnProperty("openedLabels")) {
                NarrationManager._openedLabels = (data as ExportedStep)["openedLabels"]
            }
            else {
                console.warn("[Pixi'VN] Could not import openedLabels data, so will be ignored")
            }
            if (data.hasOwnProperty("lastStepIndex")) {
                NarrationManager._lastStepIndex = (data as ExportedStep)["lastStepIndex"]
            }
            else {
                console.warn("[Pixi'VN] Could not import lastStepIndex data, so will be ignored")
            }
            if (data.hasOwnProperty("originalStepData")) {
                NarrationManager._originalStepData = (data as ExportedStep)["originalStepData"]
            }
            else {
                console.warn("[Pixi'VN] Could not import originalStepData data, so will be ignored")
            }

            if (NarrationManager.currentLabel && NarrationManager.currentLabel.onLoadStep) {
                await NarrationManager.currentLabel.onLoadStep(NarrationManager.currentLabelStepIndex || 0, NarrationManager.currentLabel)
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
