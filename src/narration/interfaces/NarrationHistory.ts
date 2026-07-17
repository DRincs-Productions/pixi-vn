import type { DialogueInterface, HistoryChoiceMenuOption } from "..";
import type { StorageElementType } from "../../storage";

export default interface NarrationHistory {
    /**
     * Dialogue to be shown in the game
     */
    dialogue?: DialogueInterface;
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
    /**
     * The number of labels that were opened (via {@link NarrationManagerInterface.call} or {@link NarrationManagerInterface.jump}) when this step ran.
     *
     * This is the size of the label call-stack at this step, and can be used to split a page into paragraphs:
     * every time this number increases compared to the previous step, a `call` opened a new paragraph. A `jump`
     * instead starts a whole new page, so it is already reflected by {@link HistoryManagerInterface.currentLabelHistory}
     * starting over.
     */
    openedLabelsNumber?: number;
}
