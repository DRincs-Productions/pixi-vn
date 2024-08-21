import { Dialogue } from "../classes"
import { HistoryChoiceMenuOption } from "../types"

export default interface NarrativeHistory<T extends Dialogue = Dialogue> {
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
