import sha1 from 'crypto-js/sha1';
import { StepHistoryDataType } from "../types/StepHistoryDataType";
import { StepLabelType } from "../types/StepLabelType";

/**
 * Convert StepLabel to StepHistoryData
 * @param step
 * @returns
 */
export function getStepSha1(step: StepLabelType): StepHistoryDataType {
    let sha1String = sha1(step.toString().toLocaleLowerCase())
    return sha1String.toString()
}
/**
 * Check if two steps are equal
 * @param step1
 * @param step2
 * @returns
 */
export function checkIfStepsIsEqual(step1: StepHistoryDataType | StepLabelType, step2: StepHistoryDataType | StepLabelType): boolean {
    return step1 === step2
}
