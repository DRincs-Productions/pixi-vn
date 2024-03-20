import { LabelRunModeEnum } from "../enums/LabelRunModeEnum"
import Label from "./Label"

/**
 * MenuOptionLabel is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new MenuOptionLabel("Events Test", EventsTestLabel)
 * ```
 */
export default class MenuOptionLabel {
    text: string
    label: typeof Label
    type: LabelRunModeEnum
    constructor(text: string, label: typeof Label, type: LabelRunModeEnum = LabelRunModeEnum.OpenByCall) {
        this.text = text
        this.label = label
        this.type = type
    }
}
