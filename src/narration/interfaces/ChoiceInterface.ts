import { StorageObjectType } from "../../storage";
import { CloseType } from "../types/CloseType";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";

export default interface ChoiceInterface {
    /**
     * Text to be displayed in the menu
     */
    text: string | string[];
    /**
     * Label Id to be opened when the option is selected
     */
    label: LabelIdType | CloseType;
    /**
     * Type of the label to be opened
     */
    type: LabelRunModeType | CloseType;
    /**
     * If this is true, the choice can only be made once.
     */
    oneTime?: boolean;
    /**
     * If this is true, the choice can see only if there are no other choices. For example, all choices are one-time choices and they are already selected.
     */
    onlyHaveNoChoice?: boolean;
    /**
     * If this is true and if is the only choice, it will be automatically selected, and call/jump to the label.
     */
    autoSelect?: boolean;
    /**
     * If true, the current label will be closed
     */
    closeCurrentLabel?: boolean;
    /**
     * Properties to be passed to the label and olther parameters that you can use when get all the choice menu options.
     */
    props?: StorageObjectType;
}
