import { CloseType, LabelRunModeType, StorageElementType, StorageObjectType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import Label from "./Label"

/**
 * ChoiceMenuOption is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOption("Events Test", EventsTestLabel)
 * ```
 */
export default class ChoiceMenuOption<T extends StorageObjectType> {
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * Label to be opened when the option is selected
     */
    label: Label<T>
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType
    /**
     * Properties to be passed to the label
     */
    props: StorageObjectType = {}
    /**
     * @param text Text to be displayed in the menu
     * @param label Label to be opened when the option is selected
     * @param type Type of the label to be opened
     * @param props Properties to be passed to the label, when the label is called. it cannot contain functions or classes.
     */
    constructor(text: string, label: typeof Label<T>, type: LabelRunModeType = "call", props?: T) {
        this.text = text
        this.label = new label()
        this.type = type
        if (props) {
            this.props = props
        }
    }
}

/**
 * ChoiceMenuOptionClose is a class that contains a text that will be displayed in the menu.
 * It is used to close the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOptionClose("Return")
 * ```
 */
export class ChoiceMenuOptionClose {
    /**
     * Label to be opened when the option is selected
     */
    label: Label = new Label()
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * @param text Text to be displayed in the menu
     */
    constructor(text: string) {
        this.text = text
    }
}

export type IStoratedChoiceMenuOptionLabel = {
    text: string
    label: LabelIdType
    type: LabelRunModeType
    props: StorageElementType
} | {
    text: string
    type: CloseType
}
