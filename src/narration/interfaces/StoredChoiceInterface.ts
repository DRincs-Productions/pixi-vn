import { ChoiceInterface } from "@drincs/pixi-vn";
import { CloseType } from "../types/CloseType";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";

export interface ChoiceOptionInterface extends Omit<ChoiceInterface, "label" | "type" | "closeCurrentLabel"> {
    /**
     * Label Id to be opened when the option is selected
     */
    label: LabelIdType;
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType;
}

export interface CloseChoiceOptionInterface extends Omit<ChoiceInterface, "label" | "type" | "closeCurrentLabel"> {
    /**
     * Type of the label to be opened
     */
    type: CloseType;
    /**
     * If true, the current label will be closed
     */
    closeCurrentLabel?: boolean;
}

type StoredChoiceInterface = ChoiceOptionInterface | CloseChoiceOptionInterface;
export type StoredIndexedChoiceInterface = StoredChoiceInterface & {
    /**
     * Is the index of the choice in the menu. It is used to identify the choice when it is selected.
     */
    choiceIndex: number;
};

export default StoredChoiceInterface;
