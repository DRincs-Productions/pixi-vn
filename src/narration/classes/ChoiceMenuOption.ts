import { StorageObjectType } from "../../storage";
import { logger } from "../../utils/log-utility";
import RegisteredLabels from "../decorators/label-decorator";
import { Close, CloseType } from "../types/CloseType";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";
import newCloseLabel from "./CloseLabel";
import Label from "./Label";
import LabelAbstract from "./LabelAbstract";

type ChoiceMenuOptionOptions = {
    /**
     * Type of the label to be opened. @default "call"
     */
    type?: LabelRunModeType;
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
    choiseIndex?: number;
};
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
    choiseIndex?: number;
};

/**
 * ChoiceMenuOption is a class that contains a Label and a text that will be displayed in the menu.
 * @example
 * ```typescript
 * new ChoiceMenuOption("Hello", HelloLabel, {})
 * ```
 */
export default class ChoiceMenuOption<T extends StorageObjectType, TLabel extends LabelAbstract<any, T> = Label<T>> {
    /**
     * Text to be displayed in the menu
     */
    text: string;
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
     * @param label Label to be opened when the option is selected or the id of the label
     * @param props Properties to be passed to the label and olther parameters that you can use when get all the choice menu options. It be converted to a JSON string, so it cannot contain functions or classes.
     * @param options Options
     */
    constructor(
        text: string,
        label: Label<T> | LabelAbstract<any, T> | LabelIdType,
        props: T,
        options?: ChoiceMenuOptionOptions
    ) {
        this.text = text;
        this._label = label;
        this.type = options?.type || "call";
        this.oneTime = options?.oneTime || false;
        this.onlyHaveNoChoice = options?.onlyHaveNoChoice || false;
        this.autoSelect = options?.autoSelect || false;
        this.choiseIndex = options?.choiseIndex;
        if (props) {
            this.props = props;
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
        this.choiseIndex = options?.choiseIndex;
    }
}

export type IStoratedChoiceMenuOption =
    | {
          /**
           * Text to be displayed in the menu
           */
          text: string;
          /**
           * Label Id to be opened when the option is selected
           */
          label: LabelIdType;
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
          props: StorageObjectType;
      }
    | {
          /**
           * Text to be displayed in the menu
           */
          text: string;
          /**
           * Type of the label to be opened
           */
          type: CloseType;
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
           * If true, the current label will be closed
           */
          closeCurrentLabel: boolean;
      };
