import { CharacterInterface } from "@drincs/pixi-vn";

export default interface DialogueInterface {
    /**
     * The text of the dialogue.
     */
    text: string | string[];
    /**
     * The id of the character that is speaking.
     */
    character?: CharacterInterface | string;
}
export type StoredDialogue = Omit<DialogueInterface, "character"> & { character: string | undefined };
