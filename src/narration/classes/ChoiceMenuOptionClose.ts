import { ChoiceInterface } from "@drincs/pixi-vn";
import { StorageObjectType } from "../../storage";
import { Close, CloseType } from "../types/CloseType";
import newCloseLabel from "./CloseLabel";
import Label from "./Label";

interface ChoiceMenuOptionCloseOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * If true, the current label will be closed. @default false
     */
    closeCurrentLabel?: boolean;
}

/**
 * ChoiceMenuOptionClose is a class that contains a text that will be displayed in the menu.
 * It is used to close the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOptionClose("Return")
 * ```
 */
export default class ChoiceMenuOptionClose<T extends {} = {}> {
    /**
     * Label to be opened when the option is selected
     */
    label: Label<T> = newCloseLabel();
    /**
     * Text to be displayed in the menu
     */
    text: string;
    /**
     * If true, the current label will be closed
     */
    closeCurrentLabel: boolean;
    /**
     * Type of the label to be opened
     */
    type: CloseType = Close;
    /**
     * If this is true, the choice can only be made once.
     */
    oneTime: boolean;
    /**
     * If this is true, the choice can see only if there are no other choices. For example, all choices are one-time choices and they are already selected.
     */
    onlyHaveNoChoice: boolean;
    /**
     * If this is true and if is the only choice, it will be automatically selected, and call/jump to the label.
     */
    autoSelect: boolean;
    /**
     * Properties to be passed to the label and olther parameters that you can use when get all the choice menu options.
     * @example
     * ```tsx
     * narration.choiceMenuOptions = [
     *     new ChoiceMenuOption("Hello", helloLabel, { disabled: true }),
     * ]
     * return <List>
     *     {narration.choiceMenuOptions?.map((item, index) => {
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
    props: StorageObjectType = {};
    /**
     * More props added by the developer
     */
    devProps: Omit<
        ChoiceInterface,
        "text" | "label" | "type" | "oneTime" | "onlyHaveNoChoice" | "autoSelect" | "closeCurrentLabel" | "props"
    > = {};
    /**
     * @param text Text to be displayed in the menu
     * @param options Options
     */
    constructor(text: string, options?: ChoiceMenuOptionCloseOptions) {
        const {
            closeCurrentLabel = false,
            oneTime = false,
            onlyHaveNoChoice = false,
            autoSelect = false,
            ...devProps
        } = options || {};
        this.text = text;
        this.closeCurrentLabel = closeCurrentLabel;
        this.oneTime = oneTime;
        this.onlyHaveNoChoice = onlyHaveNoChoice;
        this.autoSelect = autoSelect;
        this.devProps = devProps;
    }
}
