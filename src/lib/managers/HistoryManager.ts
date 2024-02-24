import { Label } from "../classes/Label"
import { labelIsRunnable } from "../functions/StepLabelUtility"
import { HistoryLabelEvent } from "../interface/HistoryLabelEvent"
import { HistoryStep } from "../interface/HistoryStep"
import { StepHistoryDataType } from "../types/StepHistoryDataType"

/**
 * HistoryManager is a class that contains the history of the game.
 */
export class HistoryManager {
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
        if (!HistoryManager.currentLabel) {
            // TODO: implement
            return
        }
        if (!labelIsRunnable(HistoryManager.currentLabel)) {
            // TODO: implement
            return
        }
        let oldSteps = HistoryManager.stepsAfterLastHistoryLabel
        let currentStepIndex = HistoryManager.currentLabel.getCorrespondingStepsNumber(oldSteps)
        let stepToRemove = oldSteps.length - currentStepIndex
        HistoryManager.removeLastHistoryNodes(stepToRemove)
        HistoryManager.loadLastStep()
    }
    public static loadLastStep() {
        // TODO: implement
    }
    private static removeLastHistoryNodes(itemNumber: number) {
        for (let i = 0; i < itemNumber; i++) {
            HistoryManager.stepHistory.pop()
        }
    }
    private static get stepsAfterLastHistoryLabel(): StepHistoryDataType[] {
        let length = HistoryManager.stepHistory.length
        let steps: StepHistoryDataType[] = []
        for (let i = length - 1; i >= 0; i--) {
            let element = HistoryManager.stepHistory[i]
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
}