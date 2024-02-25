import { Label } from "../classes/Label"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelType } from "../types/StepLabelType"

/**
 * Convert StepLabel to StepHistoryData
 * @param step
 * @returns
 */
export function convertStelLabelToStepHistoryData(step: StepLabelType): StepHistoryDataType {
    return step.toString().toLocaleLowerCase()
}
/**
 * Check if two steps are equal
 * @param step1
 * @param step2
 * @returns
 */
export function checkIfStepsIsEqual(step1: StepHistoryDataType | StepLabelType, step2: StepHistoryDataType | StepLabelType): boolean {
    if (typeof step1 === "function") {
        step1 = convertStelLabelToStepHistoryData(step1)
    }
    if (typeof step2 === "function") {
        step2 = convertStelLabelToStepHistoryData(step2)
    }
    return step1.toLocaleLowerCase() === step2.toLocaleLowerCase()
}

/**
 * After the update or code edit, some labels may no longer match.
 * @param label
 * @returns In case of label mismatch, return false.
 */
export function labelIsRunnable<T extends typeof Label>(label: T): boolean {
    try {
        let l = new label()
        let step = l.steps
        return step.length > 0
    }
    catch (e) {
        console.error(e)
        return false
    }
}
