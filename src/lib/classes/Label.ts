import { checkIfStepsIsEqual } from "../functions/StepLabelUtility"
import { StepHistoryDataType } from "../types/StepHistoryDataType"
import { StepLabelType } from "../types/StepLabelType"

/**
 * Label is a class that contains a list of steps, which will be performed as the game continues.
 * You must use the labelDecorator to register the label in the game.
 * For Ren'py this is the equivalent of a label.
 * @example
 * ```typescript
 * \@labelDecorator() // this is equivalent to labelDecorator("StartLabel")
 * export class StartLabel extends Label {
 *     override get steps(): StepLabelType[] {
 *         return [
 *             () => {
 *                 GameWindowManager.clear()
 *                 setDialogue({ character: liam, text: "Which test do you want to perform?" })
 *                 setMenuOptions([
 *                     new MenuOptionLabel("Events Test", EventsTestLabel),
 *                     new MenuOptionLabel("Show Image Test", ShowImageTest),
 *                 ])
 *             },
 *             () => GameStepManager.jumpLabel(StartLabel),
 *         ]
 *     }
 * }
 * GameStepManager.callLabel(StartLabel)
 * ```
 */
export class Label {
    /**
     * Get the steps of the label.
     * This class should be extended and the steps method should be overridden.
     * Every time you update this list will also be updated when the other game versions load.
     */
    public get steps(): StepLabelType[] { throw new Error("[Pixi'VM] The method Label.steps must be overridden") }
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
