import { Label } from "../classes/Label"
import { LabelHistoryDataType } from "../types/LabelHistoryDataType"
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

export function getLabelByClassName<T extends Label>(labelData: LabelHistoryDataType): T | undefined {
    try {
        let l = new labelData()
        let step = l.steps
        if (step.length = 0) {
            console.warn("Label has no steps")
        }
        return l as T
    }
    catch (e) {
        console.error(e)
        return
    }
}
