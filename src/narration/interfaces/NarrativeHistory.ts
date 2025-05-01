import { DialogueInterface, HistoryChoiceMenuOption } from "..";
import { StorageElementType } from "../../storage";

export default interface NarrativeHistory {
    /**
     * Dialogue to be shown in the game
     */
    dialoge?: DialogueInterface;
    /**
     * List of choices asked of the player
     */
    choices?: HistoryChoiceMenuOption[];
    /**
     * The player made a choice
     */
    playerMadeChoice?: boolean;
    /**
     * The index of the step in the history.
     */
    stepIndex: number;
    /**
     * The input value of the player
     */
    inputValue?: StorageElementType;
}
