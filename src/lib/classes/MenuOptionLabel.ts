import { RunModeLabelEnum } from "../enums/RunModeLabelEnum"
import { Label } from "./Label"

/**
 * MunuOptionLabel is a class that contains a Label and a text that will be displayed in the menu.
 */
export class MenuOptionLabel {
    text: string
    label: typeof Label
    type: RunModeLabelEnum
    constructor(text: string, label: typeof Label, type: RunModeLabelEnum = RunModeLabelEnum.OpenByCall) {
        this.text = text
        this.label = label
        this.type = type
    }
}
