import { clearChoiceMenuOptions, clearDialogue, setChoiceMenuOptions, setDialogue } from "../functions"
import { LabelProps } from "../interface"
import { GameStepManager } from "../managers"
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
            if (step.currentChoiceMenuOptions) {
                let options = step.currentChoiceMenuOptions.map((option) => {
                    return new ChoiceMenuOption(option.text, option.label, option.props, option.type)
                })
                setChoiceMenuOptions(options)
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

            if (step.end === "game_end") {
                // TODO end game
                console.warn("[Pixi'VN] Game end not implemented")
            }
            else if (step.end === "label_end") {
                GameStepManager.closeCurrentLabel()
            }
        }
    }
}
