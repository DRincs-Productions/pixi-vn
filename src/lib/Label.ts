export type StepLabel = (() => void | Promise<void>)
export type StepHistoryData = string
export function convertStelLabelToStepHistoryData(step: StepLabel): StepHistoryData {
    return step.toString().toLocaleLowerCase()
}
export function checkIfStepsIsEqual(step1: StepHistoryData | StepLabel, step2: StepHistoryData | StepLabel): boolean {
    if (typeof step1 === "function") {
        step1 = convertStelLabelToStepHistoryData(step1)
    }
    if (typeof step2 === "function") {
        step2 = convertStelLabelToStepHistoryData(step2)
    }
    return step1.toLocaleLowerCase() === step2.toLocaleLowerCase()
}

export abstract class Label {
    abstract getSteps(): StepLabel[];
    public get steps() {
        return this.getSteps()
    }
    public getCorrespondingStepsNumber(steps: StepHistoryData[]): number {
        if (steps.length === 0) {
            return 0
        }
        let res: number = 0
        steps.forEach((step, index) => {
            if (checkIfStepsIsEqual(step, this.steps[index])) {
                res = index
            }
        })
        return res
    }
}
