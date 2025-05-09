import { ChoiceInterface } from "@drincs/pixi-vn";
import { CloseType } from "../types/CloseType";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";

interface ChoiceMenuOption extends Omit<ChoiceInterface, "label" | "type" | "closeCurrentLabel"> {
    /**
     * Label Id to be opened when the option is selected
     */
    label: LabelIdType;
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType;
}

interface ChoiceMenuOptionClose extends Omit<ChoiceInterface, "label" | "type" | "closeCurrentLabel"> {
    /**
     * Type of the label to be opened
     */
    type: CloseType;
    /**
     * If true, the current label will be closed
     */
    closeCurrentLabel: boolean;
}

type StoredChoiceInterface = ChoiceMenuOption | ChoiceMenuOptionClose;

export default StoredChoiceInterface;
