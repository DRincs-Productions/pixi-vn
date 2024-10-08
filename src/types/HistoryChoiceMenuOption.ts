import { CloseType } from "./CloseType"
import LabelRunModeType from "./LabelRunModeType"

/**
 * HistoryChoiceMenuOption is a type that contains the history information of a choice menu option.
 */
type HistoryChoiceMenuOption = {
    /**
     * Text to be displayed in the menu
     */
    text: string
    /**
     * Method used to open the label, or close the menu.
     */
    type: CloseType | LabelRunModeType
    /**
     * This choice is a response
     */
    isResponse: boolean
    /**
     * The choice is hidden
     */
    hidden: boolean
}

export default HistoryChoiceMenuOption