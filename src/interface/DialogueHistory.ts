import { DialogueBaseModel } from "../classes"
import { HistoryChoiceMenuOption } from "../classes/ChoiceMenuOption"

export default interface DialogueHistory<T extends DialogueBaseModel = DialogueBaseModel> {
    /**
     * Dialogue to be shown in the game
     */
    dialoge?: T
    /**
     * List of choices asked of the player
     */
    choices?: HistoryChoiceMenuOption[]
    /**
     * The player made a choice
     */
    playerMadeChoice?: boolean
    /**
     * The index of the step in the history.
     */
    stepIndex: number
}
