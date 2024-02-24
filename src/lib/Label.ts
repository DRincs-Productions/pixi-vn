export type StepLabel = (() => void | Promise<void>)
export type StepHistoryData = string
/**
 * Convert StepLabel to StepHistoryData
 * @param step
 * @returns
 */
export function convertStelLabelToStepHistoryData(step: StepLabel): StepHistoryData {
    return step.toString().toLocaleLowerCase()
}
/**
 * Check if two steps are equal
 * @param step1
 * @param step2
 * @returns
 */
export function checkIfStepsIsEqual(step1: StepHistoryData | StepLabel, step2: StepHistoryData | StepLabel): boolean {
    if (typeof step1 === "function") {
        step1 = convertStelLabelToStepHistoryData(step1)
    }
    if (typeof step2 === "function") {
        step2 = convertStelLabelToStepHistoryData(step2)
    }
    return step1.toLocaleLowerCase() === step2.toLocaleLowerCase()
}

/**
 * Label is a class that contains a list of steps, which will be performed as the game continues.
 */
export abstract class Label {
    /**
     * Get the steps of the label.
     * Every time you update this list will also be updated when the other game versions load.
     */
    public abstract get steps(): StepLabel[]
    /**
     * Get the corresponding steps number
     * @param externalSteps
     * @returns Numer of corresponding steps, for example, if externalSteps is [ABC, DEF, GHI] and the steps of the label is [ABC, GHT], the result will be 1
     */
    public getCorrespondingStepsNumber(externalSteps: StepHistoryData[] | StepLabel[]): number {
        if (externalSteps.length === 0) {
            return 0
        }
        let res: number = 0
        externalSteps.forEach((step, index) => {
            if (checkIfStepsIsEqual(step, this.steps[index])) {
                res = index
            }
        })
        return res
    }
}
