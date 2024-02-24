import { Label } from "../classes/Label"
import { labelIsRunnable } from "../functions/StepLabelUtility"
import { HistoryLabelEvent } from "../interface/HistoryLabelEvent"
import { HistoryStep } from "../interface/HistoryStep"
import { StepHistoryDataType } from "../types/StepHistoryDataType"

/**
 * GameHistoryManager is a class that contains the history of the game.
 */
export class GameHistoryManager {
    private constructor() { }
    /**
     * stepHistory is a list of label events and steps that occurred during the progression of the steps.
     */
    public static stepHistory: (HistoryLabelEvent | HistoryStep)[] = []
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    public static currentLabel: Label | null = null
    /**
     * After the update or code edit, some steps or labels may no longer match.
     * - In case of step mismatch, the game will be updated to the last matching step.
     * - In case of label mismatch, the game gives an error.
     * @returns 
     */
    public static afterUpdate() {
        if (!GameHistoryManager.currentLabel) {
            // TODO: implement
            return
        }
        if (!labelIsRunnable(GameHistoryManager.currentLabel)) {
            // TODO: implement
            return
        }
        let oldSteps = GameHistoryManager.stepsAfterLastHistoryLabel
        let currentStepIndex = GameHistoryManager.currentLabel.getCorrespondingStepsNumber(oldSteps)
        let stepToRemove = oldSteps.length - currentStepIndex
        GameHistoryManager.removeLastHistoryNodes(stepToRemove)
        GameHistoryManager.loadLastStep()
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
            GameHistoryManager.stepHistory.pop()
        }
    }
    /**
     * stepsAfterLastHistoryLabel is a list of steps that occurred after the last history label.
     */
    private static get stepsAfterLastHistoryLabel(): StepHistoryDataType[] {
        let length = GameHistoryManager.stepHistory.length
        let steps: StepHistoryDataType[] = []
        for (let i = length - 1; i >= 0; i--) {
            let element = GameHistoryManager.stepHistory[i]
            if (typeof element === "object" && "currentStep" in element) {
                steps.push(element.currentStep)
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
        GameHistoryManager.stepHistory = []
        GameHistoryManager.currentLabel = null
    }
}