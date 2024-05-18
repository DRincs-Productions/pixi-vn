import { LabelRunModeType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import Label from "./Label"

/**
 * ChoiceMenuOptionLabel is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOptionLabel("Events Test", EventsTestLabel)
 * ```
 */
export default class ChoiceMenuOptionLabel<T extends {} = {}> {
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * Label to be opened when the option is selected
     */
    label: typeof Label<T>
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType
    /**
     * @param text Text to be displayed in the menu
     * @param label Label to be opened when the option is selected
     * @param type Type of the label to be opened
     */
    constructor(text: string, label: typeof Label<T>, type: LabelRunModeType = "call") {
        this.text = text
        this.label = label
        this.type = type
    }
}

export type IStoratedChoiceMenuOptionLabel = {
    text: string
    label: LabelIdType
    type: LabelRunModeType
}
