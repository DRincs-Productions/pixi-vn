import { LabelRunModeType, StorageObjectType } from "../types"
import { LabelIdType } from "./LabelIdType"

/**
 * Step label JSON type
 */
type StepLabelJsonType = {
    /**
     * Variable used to display a choice menu.
     */
    currentChoiceMenuOptions?: {
        /**
         * The text to be displayed.
         */
        text: string
        /**
         * The label id to be opened.
         */
        label: LabelIdType
        /**
         * Label opening mode
         */
        type: LabelRunModeType
        /**
         * The properties to be passed to the label.
         */
        props: StorageObjectType
    }[]
    /**
     * Variable used to display a dialog.
     */
    dialog?: {
        /**
         * The character id that will speak.
         */
        character: string,
        /**
         * The text to be displayed.
         */
        text: string,
    } | string
    /**
     * Variable used to open a label.
     */
    labelToOpen?: {
        /**
         * The id of the label to open.
         */
        labelId: string,
        /**
         * Label opening mode
         */
        type: LabelRunModeType,
    }
    /**
     * Variable used to end some elements of the narrative.
     * - game_end: ends the game
     * - label_end: ends the label
     */
    end?: "game_end" | "label_end"
}

export default StepLabelJsonType
