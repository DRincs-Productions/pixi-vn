import { clearChoiceMenuOptions, clearDialogue, setChoiceMenuOptions, setDialogue } from "../functions"
import { LabelProps } from "../interface"
import { GameStepManager } from "../managers"
import { StepLabelJsonType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import { StepLabelType } from "../types/StepLabelType"
import LabelAbstract from "./LabelAbstract"

export default class LabelJson<T extends {} = {}> extends LabelAbstract<LabelJson<T>, T> {
    /**
     * @param id is the id of the label
     * @param steps is the list of steps that the label will perform
     * @param props is the properties of the label
     */
    constructor(id: LabelIdType, steps: StepLabelJsonType[], props?: LabelProps<LabelJson<T>>) {
        super(id, props)
        this._steps = steps
    }

    private _steps: StepLabelJsonType[]
    /**
     * Get the steps of the label.
     */
    public get steps(): StepLabelType<T>[] {
        return this._steps.map(this.stepConverter)
    }

    private stepConverter(step: StepLabelJsonType): StepLabelType<T> {
        return (props) => {
            if (step.currentChoiceMenuOptions) {
                setChoiceMenuOptions(step.currentChoiceMenuOptions)
            }
            else {
                clearChoiceMenuOptions()
            }

            if (step.dialog) {
                setDialogue(step.dialog)
            }
            else {
                clearDialogue()
            }

            if (step.labelToOpen) {
                if (step.labelToOpen.type === "jump") {
                    GameStepManager.jumpLabel(step.labelToOpen.labelId, props)
                }
                else {
                    GameStepManager.callLabel(step.labelToOpen.labelId, props)
                }
            }
        }
    }
}
