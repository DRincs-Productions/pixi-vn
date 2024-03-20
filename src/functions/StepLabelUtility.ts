import { sha1 } from 'crypto-hash';
import { StepHistoryDataType } from "../types/StepHistoryDataType";
import { StepLabelType } from "../types/StepLabelType";

/**
 * Convert StepLabel to StepHistoryData
 * @param step
 * @returns
 */
export async function getStepSha1(step: StepLabelType): Promise<StepHistoryDataType> {
    let sha1String = await sha1(step.toString().toLocaleLowerCase())
    return sha1String
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
