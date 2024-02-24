import { Label, StepHistoryData } from "./Label"

enum LabelEventEnum {
    End = "end",
    OpenByCall = "openbycall",
    OpenByJump = "openbyjump",
}

interface HistoryLabel {
    type: LabelEventEnum,
    label: Label,
}

interface HistoryStep {
    path: string,
    storage: object,
    currentStep: StepHistoryData,
    currentStepNumber: number,
}

type HystoryElement = HistoryLabel | HistoryStep

export class HistoryManager {
    private constructor() { }
    public static stepHistory: HystoryElement[] = []
    public static lastLabel: Label | null = null
    public static afterUpdate() {
        if (!HistoryManager.lastLabel) {
            return
        }
        if (!HistoryManager.labelIsRunnable(HistoryManager.lastLabel)) {
            return
        }
        let oldSteps = HistoryManager.stepsAfterLastHistoryLabel
        let currentStepIndex = HistoryManager.lastLabel.getCorrespondingStepsNumber(oldSteps)
        let stepToRemove = oldSteps.length - currentStepIndex
        HistoryManager.removeLastHistoryNodes(stepToRemove)
        HistoryManager.loadLastStep()
    }
    public static loadLastStep() {
        // TODO: implement
    }
    private static labelIsRunnable(label: Label): boolean {
        try {
            let step = label.steps
            return step.length > 0
        }
        catch {
            return false
        }
    }
    private static removeLastHistoryNodes(itemNumber: number) {
        for (let i = 0; i < itemNumber; i++) {
            HistoryManager.stepHistory.pop()
        }
    }
    private static get stepsAfterLastHistoryLabel(): StepHistoryData[] {
        let length = HistoryManager.stepHistory.length
        let steps: StepHistoryData[] = []
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