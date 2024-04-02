import { LabelRunModeEnum } from "../enums/LabelRunModeEnum"
import Label from "./Label"

/**
 * ChoiceMenuOptionLabel is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOptionLabel("Events Test", EventsTestLabel)
 * ```
 */
export default class ChoiceMenuOptionLabel {
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * Label to be opened when the option is selected
     */
    label: typeof Label
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeEnum
    constructor(text: string, label: typeof Label, type: LabelRunModeEnum = LabelRunModeEnum.OpenByCall) {
        this.text = text
        this.label = label
        this.type = type
    }
}

export interface IStoratedChoiceMenuOptionLabel {
    text: string
    label: string
    type: LabelRunModeEnum
}
