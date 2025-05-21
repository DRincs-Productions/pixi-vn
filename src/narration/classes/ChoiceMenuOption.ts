import { ChoiceInterface } from "@drincs/pixi-vn";
import { StorageObjectType } from "../../storage";
import { logger } from "../../utils/log-utility";
import RegisteredLabels from "../decorators/RegisteredLabels";
import { ChoiceOptionInterface } from "../interfaces/StoredChoiceInterface";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";
import newCloseLabel from "./CloseLabel";
import Label from "./Label";
import LabelAbstract from "./LabelAbstract";

interface ChoiceMenuOptionOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * Type of the label to be opened. @default "call"
     */
    type?: LabelRunModeType;
}

/**
 * @deprecated Use `newChoiceOption` instead
 */
export default class ChoiceMenuOption<
    T extends StorageObjectType,
    TLabel extends LabelAbstract<any, T> = LabelAbstract<any, T>
> {
    /**
     * Text to be displayed in the menu
     */
    text: ChoiceInterface["text"];
    private _label: LabelAbstract<any, T> | LabelIdType;
    /**
     * Label to be opened when the option is selected
     */
    get label(): TLabel {
        let label = this._label;
        if (typeof label === "string") {
            let res = RegisteredLabels.get<LabelAbstract<any, T>>(label);
            if (res) {
                label = res;
            } else {
                logger.error(`Label ${label} not found, so it will be closed`);
                label = newCloseLabel<T>();
            }
        }
        return label as TLabel;
    }
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType;
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
     * @param label Label to be opened when the option is selected or the id of the label
     * @param props Properties to be passed to the label and olther parameters that you can use when get all the choice menu options. It be converted to a JSON string, so it cannot contain functions or classes.
     * @param options Options
     */
    constructor(
        text: ChoiceInterface["text"],
        label: Label<T> | LabelAbstract<any, T> | LabelIdType,
        props: T,
        options?: ChoiceMenuOptionOptions
    ) {
        const {
            type = "call",
            oneTime = false,
            onlyHaveNoChoice = false,
            autoSelect = false,
            ...devProps
        } = options || {};
        this.text = text;
        this._label = label;
        this.type = type;
        this.oneTime = oneTime;
        this.onlyHaveNoChoice = onlyHaveNoChoice;
        this.autoSelect = autoSelect;
        this.devProps = devProps;
        this.props = props;
    }
}

/**
 * Function to create a new choice menu option.
 * @example
 * ```typescript
 * newChoiceOption("Hello", HelloLabel, {})
 * ```
 */
export function newChoiceOption<T extends StorageObjectType>(
    text: ChoiceInterface["text"],
    label: Label<T> | LabelAbstract<any, T> | LabelIdType,
    props: T,
    options?: ChoiceMenuOptionOptions
): ChoiceOptionInterface {
    const labelId = typeof label === "string" ? label : label.id;
    return {
        ...options,
        label: labelId,
        props: props,
        text,
        type: options?.type || "call",
    };
}
