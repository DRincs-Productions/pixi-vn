import { LabelRunModeType, StorageObjectType } from "../types"
import { LabelIdType } from "./LabelIdType"

/**
 * Step label JSON type
 */
type StepLabelJsonType = {
    /**
     * Variable used to display a choice menu.
     */
    choiceOptions?: {
        /**
         * The text to be displayed.
         */
        text: string | string[]
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
     * This variable is used to add the next dialog text into the current dialog memory.
     * This value was added to introduce Ink Glue functionality https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#glue
     */
    glueEnabled?: boolean
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
     * If is true, the next step will be executed automatically.
     */
    goNextStep?: boolean
    /**
     * Variable used to end some elements of the narrative.
     * - game_end: ends the game
     * - label_end: ends the label
     */
    end?: "game_end" | "label_end"
}

export default StepLabelJsonType
