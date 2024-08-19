import ChoiceMenuOption from "../../classes/ChoiceMenuOption"
import LabelAbstract from "../../classes/LabelAbstract"
import { clearChoiceMenuOptions, setChoiceMenuOptions, setDialogue, setFlag } from "../../functions"
import { LabelProps } from "../../interface"
import { narration, storage } from "../../managers"
import { StepLabelJsonType } from "../../types"
import { LabelIdType } from "../../types/LabelIdType"
import { StepLabelType } from "../../types/StepLabelType"

export default class LabelJson<T extends {} = {}> extends LabelAbstract<LabelJson<T>, T> {
    /**
     * @param id is the id of the label
     * @param steps is the list of steps that the label will perform
     * @param props is the properties of the label
     */
    constructor(id: LabelIdType, steps: StepLabelJsonType[] | (() => StepLabelJsonType[]), props?: LabelProps<LabelJson<T>>) {
        super(id, props)
        this._steps = steps
    }

    private _steps: StepLabelJsonType[] | (() => StepLabelJsonType[])
    /**
     * Get the steps of the label.
     */
    public get steps(): StepLabelType<T>[] {
        if (typeof this._steps === "function") {
            return this._steps().map(this.stepConverter)
        }
        return this._steps.map(this.stepConverter)
    }

    private stepConverter(step: StepLabelJsonType): StepLabelType<T> {
        return (props) => {
            if (step.choices) {
                let options = step.choices.map((option) => {
                    let text: string = ""
                    if (Array.isArray(option.text)) {
                        text = option.text.join()
                    }
                    else {
                        text = option.text
                    }
                    return new ChoiceMenuOption(text, option.label, option.props, option.type)
                })
                setChoiceMenuOptions(options)
            }
            else {
                clearChoiceMenuOptions()
            }

            if (step.glueEnabled) {
                setFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, true)
            }
            else if (step.glueEnabled === false) {
                setFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, false)
            }
            if (step.dialog) {
                setDialogue(step.dialog)
            }

            if (step.labelToOpen) {
                if (step.labelToOpen.type === "jump") {
                    narration.jumpLabel(step.labelToOpen.labelId, props)
                }
                else {
                    narration.callLabel(step.labelToOpen.labelId, props)
                }
            }

            if (step.goNextStep) {
                narration.goNext(props)
            }

            if (step.end === "game_end") {
                narration.closeAllLabels()
                narration.goNext(props)
            }
            else if (step.end === "label_end") {
                narration.closeCurrentLabel()
            }
        }
    }
}