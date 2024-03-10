import { Label } from "../classes/Label"
import { getLabelInstanceByClassName } from "../decorators/LabelDecorator"
import { HistoryLabelEventEnum } from "../enums/LabelEventEnum"
import { clearMenuOptions, setMenuOptions } from "../functions/DialogueUtility"
import { convertStepLabelToStepHistoryData } from "../functions/StepLabelUtility"
import { IHistoryLabelEvent } from "../interface/IHistoryLabelEvent"
import { IHistoryStep } from "../interface/IHistoryStep"
import { ExportedStep } from "../interface/export/ExportedStep"
import { LabelTagType } from "../types/LabelTagType"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelType } from "../types/StepLabelType"
import { GameStorageManager } from "./StorageManager"
import { GameWindowManager } from "./WindowManager"

/**
 * GameHistoryManager is a class that contains the history of the game.
 */
export class GameStepManager {
    private constructor() { }
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    public static stepsHistory: (IHistoryLabelEvent | IHistoryStep)[] = []
    private static openedLabels: LabelTagType[] = []
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    public static get currentLabel(): LabelTagType | null {
        if (GameStepManager.openedLabels.length > 0) {
            return GameStepManager.openedLabels[GameStepManager.openedLabels.length - 1]
        }
        return null
    }
    /**
     * After the update or code edit, some steps or labels may no longer match.
     * - In case of step mismatch, the game will be updated to the last matching step.
     * - In case of label mismatch, the game gives an error.
     * @returns 
     */
    public static afterUpdate() {
        if (!GameStepManager.currentLabel) {
            // TODO: implement
            return
        }
        let currentLabel = getLabelInstanceByClassName(GameStepManager.currentLabel)
        if (!currentLabel) {
            console.error("Label not found")
            return
        }
        let oldSteps = GameStepManager.stepsAfterLastHistoryLabel
        let currentStepIndex = currentLabel.getCorrespondingStepsNumber(oldSteps)
        let stepToRemove = oldSteps.length - currentStepIndex
        GameStepManager.removeLastHistoryNodes(stepToRemove)
        GameStepManager.loadLastStep()
    }
    public static loadLastStep() {
        // TODO: implement
    }
    /**
     * Remove a number of items from the last of the history.
     * @param itemNumber The number of items to remove from the last of the history.
     */
    private static removeLastHistoryNodes(itemNumber: number) {
        for (let i = 0; i < itemNumber; i++) {
            GameStepManager.stepsHistory.pop()
        }
    }
    /**
     * stepsAfterLastHistoryLabel is a list of steps that occurred after the last history label.
     */
    private static get stepsAfterLastHistoryLabel(): StepHistoryDataType[] {
        let length = GameStepManager.stepsHistory.length
        let steps: StepHistoryDataType[] = []
        for (let i = length - 1; i >= 0; i--) {
            let element = GameStepManager.stepsHistory[i]
            if (typeof element === "object" && "step" in element) {
                steps.push(element.step)
            }
            else {
                break
            }
        }

        steps = steps.reverse()
        return steps
    }
    /**
     * Add a label to the history.
     */
    public static clear() {
        GameStepManager.stepsHistory = []
        GameStepManager.openedLabels = []
    }
    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    public static addStepHistory(step: StepLabelType) {
        let stepHistory: StepHistoryDataType = convertStepLabelToStepHistoryData(step)
        let historyStep: IHistoryStep = {
            path: window.location.pathname,
            storage: GameStorageManager.export(),
            step: stepHistory,
            canvas: GameWindowManager.export(),
        }
        GameStepManager.stepsHistory.push(historyStep)
    }
    /**
     * Execute the next step and add it to the history.
     * @returns
     */
    public static async runNextStep() {
        let lasteStepsLength = GameStepManager.stepsAfterLastHistoryLabel.length
        if (GameStepManager.currentLabel) {
            let currentLabel = getLabelInstanceByClassName(GameStepManager.currentLabel)
            if (!currentLabel) {
                console.error("Label not found")
                return
            }
            let n = currentLabel.steps.length
            if (n > lasteStepsLength) {
                let nextStep = currentLabel.steps[lasteStepsLength]
                GameStepManager.addStepHistory(nextStep)
                let value = await nextStep()
                // if is menu
                if (value) {
                    GameStepManager.addMenuHistory(GameStepManager.currentLabel)
                    setMenuOptions(value)
                }
                else {
                    clearMenuOptions()
                }
            }
            else {
                GameStepManager.closeLabel()
                GameStepManager.runNextStep()
                return
            }
        }
        console.warn("No next step")
    }
    public static async runLabel(label: typeof Label | Label) {
        try {
            if (label instanceof Label) {
                label = label.constructor as typeof Label
            }
            let labelName = label.name
            GameStepManager.openLabel(labelName)
        }
        catch (e) {
            console.error(e)
            return
        }
        return await GameStepManager.runNextStep()
    }
    private static openLabel(label: LabelTagType) {
        let currentLabel = getLabelInstanceByClassName(label)
        if (!currentLabel) {
            throw new Error("Label not found")
        }
        let historyLabel: IHistoryLabelEvent = {
            label: label,
            type: HistoryLabelEventEnum.OpenByCall,
            labelClassName: currentLabel.constructor.name,
        }
        GameStepManager.stepsHistory.push(historyLabel)
        GameStepManager.openedLabels.push(label)
    }
    private static closeLabel() {
        if (!GameStepManager.currentLabel) {
            console.warn("No label to close")
            return
        }
        let currentLabel = getLabelInstanceByClassName(GameStepManager.currentLabel)
        if (!currentLabel) {
            console.error("Label not found")
            return
        }
        let historyLabel: IHistoryLabelEvent = {
            label: GameStepManager.currentLabel,
            type: HistoryLabelEventEnum.End,
            labelClassName: currentLabel.constructor.name,
        }
        GameStepManager.stepsHistory.push(historyLabel)
        GameStepManager.openedLabels.pop()
    }
    private static addMenuHistory(label: LabelTagType) {
        let currentLabel = getLabelInstanceByClassName(label)
        if (!currentLabel) {
            console.error("Label not found")
            return
        }
        let historyLabel: IHistoryLabelEvent = {
            label: label,
            type: HistoryLabelEventEnum.OpenMenu,
            labelClassName: currentLabel.constructor.name,
        }
        GameStepManager.stepsHistory.push(historyLabel)
    }
    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedStep {
        return {
            stepsHistory: GameStepManager.stepsHistory,
            openedLabels: GameStepManager.openedLabels,
        }
    }
    public static importJson(dataString: string) {
        GameStepManager.import(JSON.parse(dataString))
    }
    public static import(data: object) {
        GameStepManager.clear()
        try {
            if (data.hasOwnProperty("stepsHistory")) {
                GameStepManager.stepsHistory = (data as ExportedStep)["stepsHistory"] as (IHistoryLabelEvent | IHistoryStep)[]
            }
            else {
                console.log("No stepsHistory data found")
            }
            if (data.hasOwnProperty("openedLabels")) {
                GameStepManager.openedLabels = (data as ExportedStep)["openedLabels"] as LabelTagType[]
            }
            else {
                console.log("No openedLabels data found")
            }
        }
        catch (e) {
            console.error("Error importing data", e)
        }
    }
}