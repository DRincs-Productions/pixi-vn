import { checkIfStepsIsEqual } from "../functions/StepLabelUtility"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelType } from "../types/StepLabelType"

/**
 * Label is a class that contains a list of steps, which will be performed as the game continues.
 * For Ren'py this is the equivalent of a label.
 */
export default class Label {
    /**
     * Get the steps of the label.
     * Every time you update this list will also be updated when the other game versions load.
     */
    public get steps(): StepLabelType[] {
        console.warn("This method should be overridden")
        throw new Error("This method should be overridden")
    }
    /**
     * Get the corresponding steps number
     * @param externalSteps
     * @returns Numer of corresponding steps, for example, if externalSteps is [ABC, DEF, GHI] and the steps of the label is [ABC, GHT], the result will be 1
     */
    public getCorrespondingStepsNumber(externalSteps: StepHistoryDataType[] | StepLabelType[]): number {
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
