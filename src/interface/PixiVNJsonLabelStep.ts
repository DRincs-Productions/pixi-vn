import { LabelRunModeType, StorageObjectType } from "../types"
import { LabelIdType } from "../types/LabelIdType"
import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import { PixiVNJsonLabel } from "./PixiVNJsonLabels"
import PixiVNJsonOperations from "./PixiVNJsonOperations"

export type PixiVNJsonChoice = {
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
}
export type PixiVNJsonChoices = (PixiVNJsonChoice | PixiVNJsonIfElse<PixiVNJsonChoice>)[]

export type PixiVNJsonDialogText = string | PixiVNJsonIfElse<string> | (string | PixiVNJsonIfElse<string>)[]

export type PixiVNJsonDialog<Text = string> = {
    /**
     * The character id that will speak.
     */
    character: string,
    /** 
     * The text to be displayed.
     */
    text: Text,
} | Text

export type PixiVNJsonLabelToOpen = {
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
 * Steps of a {@link PixiVNJsonLabel}.
 * Order of operations:
 * 1. run all {@link PixiVNJsonLabelStep.operation}
 * 2. set {@link PixiVNJsonLabelStep.choices}, {@link PixiVNJsonLabelStep.dialogue}, {@link PixiVNJsonLabelStep.glueEnabled}
 * 3. open {@link PixiVNJsonLabelStep.labelToOpen}
 * 4. go to next step if {@link PixiVNJsonLabelStep.goNextStep} is true
 * 5. end the label if {@link PixiVNJsonLabelStep.end} is "label_end"
 */
type PixiVNJsonLabelStep = {
    operation?: PixiVNJsonOperations
    /**
     * Variable used to display a choice menu.
     */
    choices?: PixiVNJsonChoices | PixiVNJsonIfElse<PixiVNJsonChoices>
    /**
     * Variable used to display a dialog.
     */
    dialogue?: PixiVNJsonDialog<PixiVNJsonDialogText> | PixiVNJsonIfElse<PixiVNJsonDialog<PixiVNJsonDialogText>>
    /**
     * This variable is used to add the next dialog text into the current dialog memory.
     * This value was added to introduce Ink Glue functionality https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#glue
     */
    glueEnabled?: boolean | PixiVNJsonIfElse<boolean>
    /**
     * Variable used to open a label.
     */
    labelToOpen?: PixiVNJsonLabelToOpen | PixiVNJsonIfElse<PixiVNJsonLabelToOpen>
    /**
     * If is true, the next step will be executed automatically.
     */
    goNextStep?: boolean | PixiVNJsonIfElse<boolean>
    /**
     * Variable used to end some elements of the narrative.
     * - game_end: ends the game
     * - label_end: ends the label
     */
    end?: "game_end" | "label_end" | PixiVNJsonIfElse<"game_end" | "label_end">
}

export default PixiVNJsonLabelStep
