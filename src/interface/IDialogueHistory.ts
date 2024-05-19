import { DialogueBaseModel } from "../classes"
import { IStoratedChoiceMenuOptionLabel } from "../classes/ChoiceMenuOption"

export interface IDialogueHistory<T extends DialogueBaseModel = DialogueBaseModel> {
    /**
     * Dialogue to be shown in the game
     */
    dialoge?: T
    /**
     * List of choices asked of the player
     */
    choices?: IStoratedChoiceMenuOptionLabel[]
    /**
     * Choice made by the player
     */
    choiceMade?: IStoratedChoiceMenuOptionLabel
    /**
     * The index of the step in the history.
     */
    stepIndex: number
}
