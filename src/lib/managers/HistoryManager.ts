import { HistoryLabelEventEnum } from "../enums/LabelEventEnum"
import { convertStelLabelToStepHistoryData, getLabelByClassName } from "../functions/StepLabelUtility"
import { HistoryLabelEvent } from "../interface/HistoryLabelEvent"
import { HistoryStep } from "../interface/HistoryStep"
import { LabelHistoryDataType } from "../types/LabelHistoryDataType"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelType } from "../types/StepLabelType"
import { GameStorageManager } from "./StorageManager"

/**
 * GameHistoryManager is a class that contains the history of the game.
 */
export class GameStepManager {
    private constructor() { }
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    public static stepsHistory: (HistoryLabelEvent | HistoryStep)[] = []
    private static openedLabels: LabelHistoryDataType[] = []
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    public static get currentLabel(): LabelHistoryDataType | null {
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
        let currentLabel = getLabelByClassName(GameStepManager.currentLabel)
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
        let stepHistory: StepHistoryDataType = convertStelLabelToStepHistoryData(step)
        let historyStep: HistoryStep = {
            path: window.location.pathname,
            storage: GameStorageManager.export(),
            step: stepHistory,
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
            let currentLabel = getLabelByClassName(GameStepManager.currentLabel)
            if (!currentLabel) {
                console.error("Label not found")
                return
            }
            let n = currentLabel.steps.length
            if (n > lasteStepsLength) {
                let nextStep = currentLabel.steps[lasteStepsLength]
                GameStepManager.addStepHistory(nextStep)
                await nextStep()
                return
            }
            if (n === lasteStepsLength) {
                GameStepManager.closeLabel()
                GameStepManager.runNextStep()
                return
            }
        }
        console.warn("No next step")
    }
    public static async runLabel(label: LabelHistoryDataType) {
        GameStepManager.openLabel(label)
        await GameStepManager.runNextStep()
    }
    private static openLabel(label: LabelHistoryDataType) {
        let historyLabel: HistoryLabelEvent = {
            label: label,
            type: HistoryLabelEventEnum.OpenByCall,
        }
        GameStepManager.stepsHistory.push(historyLabel)
        GameStepManager.openedLabels.push(label)
    }
    private static closeLabel() {
        if (!GameStepManager.currentLabel) {
            console.warn("No label to close")
            return
        }
        let historyLabel: HistoryLabelEvent = {
            label: GameStepManager.currentLabel,
            type: HistoryLabelEventEnum.End,
        }
        GameStepManager.stepsHistory.push(historyLabel)
        GameStepManager.openedLabels.pop()
    }
}