import { DialogueModelBase } from "../classes"
import { IStoratedChoiceMenuOptionLabel } from "../classes/ChoiceMenuOptionLabel"

export interface IDialogueHistory<T extends DialogueModelBase = DialogueModelBase> {
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
    stepIndex: number
}
