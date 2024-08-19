import { clearChoiceMenuOptions, setChoiceMenuOptions, setDialogue, setFlag } from "../functions"
import { getValueFromIfElse, setStorageJson } from "../functions/PixiVNJsonUtility"
import { LabelProps, PixiVNJsonIfElse, PixiVNJsonLabelStep, PixiVNJsonStorageSet } from "../interface"
import { PixiVNJsonDialog, PixiVNJsonDialogText } from "../interface/PixiVNJsonLabelStep"
import { narration, storage } from "../managers"
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
    constructor(id: LabelIdType, steps: PixiVNJsonLabelStep[] | (() => PixiVNJsonLabelStep[]), props?: LabelProps<LabelJson<T>>) {
        super(id, props)
        this._steps = steps
    }

    private _steps: PixiVNJsonLabelStep[] | (() => PixiVNJsonLabelStep[])
    /**
     * Get the steps of the label.
     */
    public get steps(): StepLabelType<T>[] {
        if (typeof this._steps === "function") {
            return this._steps().map(this.stepConverter)
        }
        return this._steps.map(this.stepConverter)
    }

    private getDialogueText(origin: PixiVNJsonDialogText): string | string[] {
        let text: string | string[] = ""
        if (Array.isArray(origin)) {
            let texts: string[] = []
            origin.forEach((t) => {
                texts.push(getValueFromIfElse(t))
            })
            text = texts
        }
        else {
            text = getValueFromIfElse(origin)
        }
        return text
    }
    private getDialogue(origin: PixiVNJsonDialog<PixiVNJsonDialogText> | PixiVNJsonIfElse<PixiVNJsonDialog<PixiVNJsonDialogText>> | undefined): PixiVNJsonDialog<string | string[]> | undefined {
        let d = getValueFromIfElse(origin)
        let dialogue: PixiVNJsonDialog<string | string[]> | undefined = undefined
        if (d) {
            if (typeof d === "object" && "character" in d && "text" in d) {
                dialogue = {
                    character: d.character,
                    text: this.getDialogueText(d.text)
                }
            }
            else {
                dialogue = this.getDialogueText(d)
            }
        }
        return dialogue
    }

    private stepConverter(step: PixiVNJsonLabelStep): StepLabelType<T> {
        return (props) => {
            if (step.operation) {
                step.operation.forEach((operation) => {
                    this.runOperation(operation)
                })
            }

            let choices = getValueFromIfElse(step.choices)
            let glueEnabled = getValueFromIfElse(step.glueEnabled)
            let dialogue: PixiVNJsonDialog<string | string[]> | undefined = this.getDialogue(step.dialogue)
            let labelToOpen = getValueFromIfElse(step.labelToOpen)
            let goNextStep = getValueFromIfElse(step.goNextStep)
            let end = getValueFromIfElse(step.end)

            if (choices) {
                let options = choices.map((option) => {
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

            if (glueEnabled) {
                setFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, true)
            }
            else if (glueEnabled === false) {
                setFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, false)
            }
            if (dialogue) {
                setDialogue(dialogue)
            }

            if (labelToOpen) {
                if (labelToOpen.type === "jump") {
                    narration.jumpLabel(labelToOpen.labelId, props)
                }
                else {
                    narration.callLabel(labelToOpen.labelId, props)
                }
            }

            if (goNextStep) {
                narration.goNext(props)
            }

            if (end === "game_end") {
                narration.closeAllLabels()
                narration.goNext(props)
            }
            else if (end === "label_end") {
                narration.closeCurrentLabel()
            }
        }
    }

    private runOperation(origin: PixiVNJsonStorageSet | PixiVNJsonIfElse<PixiVNJsonStorageSet>): void {
        let operation = getValueFromIfElse(origin)
        if (operation.type == "storage") {
            setStorageJson(operation)
        }
    }
}
