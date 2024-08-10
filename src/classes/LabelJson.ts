import { clearChoiceMenuOptions, clearDialogue, setChoiceMenuOptions, setDialogue, setFlag } from "../functions"
import { LabelProps } from "../interface"
import { GameStepManager, GameStorageManager } from "../managers"
import { StepLabelJsonType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import { StepLabelType } from "../types/StepLabelType"
import ChoiceMenuOption from "./ChoiceMenuOption"
import LabelAbstract from "./LabelAbstract"

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
                setFlag(GameStorageManager.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, true)
            }
            else if (step.glueEnabled === false) {
                setFlag(GameStorageManager.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, false)
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

            if (step.goNextStep) {
                GameStepManager.goNext(props)
            }

            if (step.end === "game_end") {
                GameStepManager.closeAllLabels()
                GameStepManager.goNext(props)
            }
            else if (step.end === "label_end") {
                GameStepManager.closeCurrentLabel()
            }
        }
    }
}
