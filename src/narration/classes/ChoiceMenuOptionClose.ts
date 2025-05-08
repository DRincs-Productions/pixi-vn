import { StorageObjectType } from "../../storage";
import { Close, CloseType } from "../types/CloseType";
import newCloseLabel from "./CloseLabel";
import Label from "./Label";

type ChoiceMenuOptionCloseOptions = {
    /**
     * If true, the current label will be closed. @default false
     */
    closeCurrentLabel?: boolean;
    /**
     * If this is true, the choice can only be made once. @default false
     */
    oneTime?: boolean;
    /**
     * If this is true, the choice can see only if there are no other choices. For example, all choices are one-time choices and they are already selected.
     * @default false
     */
    onlyHaveNoChoice?: boolean;
    /**
     * If this is true and if is the only choice, it will be automatically selected, and call/jump to the label.
     * @default false
     */
    autoSelect?: boolean;
    /**
     * Is the index of the choice in the menu. It is used to identify the choice when it is selected.
     */
    choiceIndex?: number;
};

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
     * Is the index of the choice in the menu. It is used to identify the choice when it is selected.
     */
    choiseIndex?: number;
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
     * @param text Text to be displayed in the menu
     * @param closeCurrentLabel If true, the current label will be closed. @default false
     */
    constructor(text: string, options?: ChoiceMenuOptionCloseOptions) {
        this.text = text;
        this.closeCurrentLabel = options?.closeCurrentLabel || false;
        this.oneTime = options?.oneTime || false;
        this.onlyHaveNoChoice = options?.onlyHaveNoChoice || false;
        this.autoSelect = options?.autoSelect || false;
        this.choiseIndex = options?.choiceIndex;
    }
}
