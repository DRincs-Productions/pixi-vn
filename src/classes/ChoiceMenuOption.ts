import { getLabelById } from "../decorators"
import { Close, CloseType, LabelRunModeType, StorageObjectType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import newCloseLabel from "./CloseLabel"
import Label from "./Label"

/**
 * ChoiceMenuOption is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOption("Hello", HelloLabel, {})
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
     * Properties to be passed to the label and olther parameters that you can use when get all the choice menu options.
     * @example
     * ```tsx
     * setChoiceMenuOptions([
     *     new ChoiceMenuOption("Hello", helloLabel, { disabled: true }),
     * ])
     * return <List>
     *     {getChoiceMenuOptions()?.map((item, index) => {
     *         return (
     *             <ChoiceButton
     *                 disabled={item.props.disabled}
     *                 onClick={() => {
     *                     afterSelectChoice(item)
     *                 }}
     *             >
     *                 {item.text}
     *             </ChoiceButton>
     *         )
     *     })}
     * </List>
     * ```
     */
    props: StorageObjectType = {}
    /**
     * @param text Text to be displayed in the menu
     * @param label Label to be opened when the option is selected or the id of the label
     * @param props Properties to be passed to the label and olther parameters that you can use when get all the choice menu options. It be converted to a JSON string, so it cannot contain functions or classes.
     * @param type Type of the label to be opened. @default "call"
     */
    constructor(text: string, label: Label<T> | LabelIdType, props: T, type: LabelRunModeType = "call") {
        if (typeof label === 'string') {
            let tLabel = getLabelById(label)
            if (!tLabel) {
                throw new Error(`[Pixi'VN] Label ${label} not found`)
            }
            else {
                label = tLabel
            }
        }
        this.text = text
        this.label = label
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
export class ChoiceMenuOptionClose<T extends {} = {}> {
    /**
     * Label to be opened when the option is selected
     */
    label: Label<T> = newCloseLabel()
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * If true, the current label will be closed
     */
    closeCurrentLabel: boolean
    /**
     * Type of the label to be opened
     */
    type: CloseType = Close
    /**
     * Properties to be passed to the label and olther parameters that you can use when get all the choice menu options.
     * @example
     * ```tsx
     * setChoiceMenuOptions([
     *     new ChoiceMenuOption("Hello", helloLabel, { disabled: true }),
     * ])
     * return <List>
     *     {getChoiceMenuOptions()?.map((item, index) => {
     *         return (
     *             <ChoiceButton
     *                 disabled={item.props.disabled}
     *                 onClick={() => {
     *                     afterSelectChoice(item)
     *                 }}
     *             >
     *                 {item.text}
     *             </ChoiceButton>
     *         )
     *     })}
     * </List>
     * ```
     */
    props: StorageObjectType = {}
    /**
     * @param text Text to be displayed in the menu
     * @param closeCurrentLabel If true, the current label will be closed. @default false
     */
    constructor(text: string, closeCurrentLabel: boolean = false) {
        this.text = text
        this.closeCurrentLabel = closeCurrentLabel
    }
}

export type IStoratedChoiceMenuOption = {
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * Label Id to be opened when the option is selected
     */
    label: LabelIdType
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType
    /**
     * Properties to be passed to the label and olther parameters that you can use when get all the choice menu options.
     * @example
     * ```tsx
     * setChoiceMenuOptions([
     *     new ChoiceMenuOption("Hello", helloLabel, { disabled: true }),
     * ])
     * return <List>
     *     {getChoiceMenuOptions()?.map((item, index) => {
     *         return (
     *             <ChoiceButton
     *                 disabled={item.props.disabled}
     *                 onClick={() => {
     *                     afterSelectChoice(item)
     *                 }}
     *             >
     *                 {item.text}
     *             </ChoiceButton>
     *         )
     *     })}
     * </List>
     * ```
     */
    props: StorageObjectType
} | {
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * Type of the label to be opened
     */
    type: CloseType
    /**
     * If true, the current label will be closed
     */
    closeCurrentLabel: boolean
}

