import { LabelProps } from "../interface"
import { LabelIdType } from "../types/LabelIdType"
import { StepLabelType } from "../types/StepLabelType"
import LabelAbstract from "./LabelAbstract"

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
export default class Label<T extends {} = {}> extends LabelAbstract<Label<T>, T> {
    /**
     * @param id is the id of the label
     * @param steps is the list of steps that the label will perform
     * @param props is the properties of the label
     */
    constructor(id: LabelIdType, steps: StepLabelType<T>[] | (() => StepLabelType<T>[]), props?: LabelProps<Label<T>>) {
        super(id, props)
        this._steps = steps
    }

    private _steps: StepLabelType<T>[] | (() => StepLabelType<T>[])
    /**
     * Get the steps of the label.
     */
    public get steps(): StepLabelType<T>[] {
        if (typeof this._steps === "function") {
            return this._steps()
        }
        return this._steps
    }
}
