import { ChoiceInterface } from "@drincs/pixi-vn";
import { CloseType } from "../types/CloseType";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";

interface Props
    extends Omit<
        ChoiceInterface,
        "text" | "label" | "type" | "oneTime" | "onlyHaveNoChoice" | "autoSelect" | "closeCurrentLabel"
    > {}

interface ChoiceMenuOption {
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
    props: Props;
}

interface ChoiceMenuOptionClose {
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
    props: Props;
}

type IStoratedChoiceMenuOption = ChoiceMenuOption | ChoiceMenuOptionClose;

export default IStoratedChoiceMenuOption;
