import { checkIfStepsIsEqual } from "../functions/StepLabelUtility"
import { LabelIdType } from "../types/LabelIdType"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelType } from "../types/StepLabelType"

/**
 * Label is a class that contains a list of steps, which will be performed as the game continues.
 * For Ren'py this is the equivalent of a label.
 * @example
 * ```typescript
 * const START_LABEL_ID = "StartLabel"
 * 
 * export const startLabel = newLabel(START_LABEL_ID,
 *     [
 *         (props) => {
 *             GameWindowManager.clear()
 *             setDialogue({ character: liam, text: "Which test do you want to perform?" })
 *             setChoiceMenuOptions([
 *                 new ChoiceMenuOption("Events Test", eventsTestLabel),
 *                 new ChoiceMenuOption("Show Image Test", showImageTest),
 *             ])
 *         },
 *         (props) => GameStepManager.jumpLabel(START_LABEL_ID, props),
 *     ]
 * )
 * 
 * GameStepManager.callLabel(StartLabel)
 * ```
 */
export default class Label<T extends {} = {}> {
    /**
     * @param id is the id of the label
     * @param steps is the list of steps that the label will perform
     */
    constructor(id: LabelIdType, steps: StepLabelType<T>[], choiseIndex?: number) {
        this._id = id
        this._steps = steps
        this._choiseIndex = choiseIndex
    }

    private _id: LabelIdType
    /**
     * Get the id of the label
     */
    public get id(): LabelIdType {
        return this._id
    }

    private _steps: StepLabelType<T>[]
    /**
     * Get the steps of the label.
     * This class should be extended and the steps method should be overridden.
     * Every time you update this list will also be updated when the other game versions load.
     */
    public get steps(): StepLabelType<T>[] {
        return this._steps
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

    private _choiseIndex: number | undefined
    public get choiseIndex(): number | undefined {
        return this._choiseIndex
    }
}
