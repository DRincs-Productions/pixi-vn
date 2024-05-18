import { LabelRunModeType, StorageElementType, StorageObjectType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import Label from "./Label"

/**
 * ChoiceMenuOptionLabel is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOptionLabel("Events Test", EventsTestLabel)
 * ```
 */
export default class ChoiceMenuOptionLabel<T extends StorageObjectType> {
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
        this.label = label
        this.type = type
        if (props) {
            this.props = props
        }
    }
}

export type IStoratedChoiceMenuOptionLabel = {
    text: string
    label: LabelIdType
    type: LabelRunModeType
    props: StorageElementType
}
