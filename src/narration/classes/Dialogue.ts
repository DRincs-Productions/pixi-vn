import { CharacterInterface } from "../../interfaces";
import { StorageElementType } from "../../types";

type DialogueProps = {
    /**
     * The text of the dialogue.
     */
    text: string;
    /**
     * The id of the character that is speaking.
     */
    character?: string;
    /**
     * Other parameters that can be stored in the dialogue.
     */
    oltherParams?: Record<string | number | symbol, StorageElementType>;
};

/**
 * Base class for all dialogue models.
 * You can extend this class, but it is not reccomended. You can use the oltherParams property to store any other data you need.
 * @example
 * ```typescript
 * narration.dialogue = new Dialogue("Hello World", character)
 * ```
 */
export default class Dialogue<TCharacter extends CharacterInterface = CharacterInterface> {
    /**
     * @param text The text of the dialogue.
     * @param character The id of the character that is speaking.
     * @param oltherParams Other parameters that can be stored in the dialogue.
     */
    constructor(
        text: string | DialogueProps,
        character?: string | TCharacter,
        oltherParams: { [key: string]: StorageElementType } = {}
    ) {
        if (typeof text === "string") {
            this.text = text;
            if (typeof character === "string") {
                this.character = character;
            } else {
                this.character = character?.id;
            }
            this.oltherParams = oltherParams;
        } else {
            this.text = text.text;
            if (text.character) {
                this.character = text.character;
            }
            this.oltherParams = text.oltherParams || {};
        }
    }
    /**
     * The text of the dialogue.
     */
    text: string = "";
    /**
     * The id of the character that is speaking.
     */
    character?: string;
    /**
     * Other parameters that can be stored in the dialogue.
     */
    oltherParams: { [key: string]: StorageElementType } = {};
    /**
     * Export the dialogue to a DialogueBaseData object.
     *
     * @returns The data of the dialogue.
     */
    export(): DialogueProps {
        return {
            text: this.text,
            character: this.character,
            oltherParams: this.oltherParams,
        };
    }
}
