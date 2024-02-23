import { Label } from "./Label"

type StepHistory = string

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
    currentStep: StepHistory,
    currentStepNumber: number,
}

type HystoryElement = HistoryLabel | HistoryStep

export class HistoryManager {
    private constructor() { }
    public static stepHistory: HystoryElement[] = []
    public static lastLabel: Label | null = null
    public static next() {
        if (HistoryManager.lastLabel) {
            // TODO: add check if is development and if is a laod save
            let steps = HistoryManager.stepsAfterLastHistoryLabel
            let res = HistoryManager.lastLabel.findLastStepIndex(steps)
            // TODO: remove the inutil steps
            // TODO: load lastest step

            // TODO: else get the next step by index
        }
    }
    public static get stepsAfterLastHistoryLabel(): string[] {
        let length = HistoryManager.stepHistory.length
        let steps: string[] = []
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