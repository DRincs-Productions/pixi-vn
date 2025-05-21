import { ChoiceInterface } from "@drincs/pixi-vn";
import { StorageObjectType } from "../../storage";
import { CloseChoiceOptionInterface } from "../interfaces/StoredChoiceInterface";
import { Close, CloseType } from "../types/CloseType";

interface ChoiceMenuOptionCloseOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * If true, the current label will be closed. @default false
     */
    closeCurrentLabel?: boolean;
}

/**
 * @deprecated Use `newCloseChoiceOption` instead
 */
export default class ChoiceMenuOptionClose {
    /**
     * Text to be displayed in the menu
     */
    text: ChoiceInterface["text"];
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
     *     newChoiceOption("Hello", helloLabel, { disabled: true }),
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
    constructor(text: ChoiceInterface["text"], options?: ChoiceMenuOptionCloseOptions) {
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

/**
 * Function to create a new choice menu option that will close the menu.
 * @example
 * ```typescript
 * newCloseChoiceOption("Return")
 * ```
 */
export function newCloseChoiceOption(
    text: ChoiceInterface["text"],
    options?: ChoiceMenuOptionCloseOptions
): CloseChoiceOptionInterface {
    return {
        ...options,
        type: Close,
        text,
    };
}
