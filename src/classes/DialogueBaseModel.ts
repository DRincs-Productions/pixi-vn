import CharacterBaseModel from "./CharacterBaseModel"

/**
 * Base class for all dialogue models. I suggest you extend this class to create your own dialogue models.
 * @example
 * ```typescript
 * export class DialogueModel extends DialogueBaseModel {
 *     constructor(
 *         character: CharacterBaseModel | string,
 *         text: string,
 *         emotion: string
 *     ) {
 *         super(character, text);
 *         this.emotion = emotion;
 *     }
 *     emotion = ""
 * }
 * ```
 */
export default class DialogueBaseModel<TCharacter extends CharacterBaseModel = CharacterBaseModel> {
    constructor(text: string, character: string | TCharacter | undefined) {
        this.text = text
        if (typeof character === "string") {
            this.characterId = character
        }
        else {
            this.characterId = character?.id
        }
    }
    /**
     * The text of the dialogue.
     */
    text: string = ""
    /**
     * The id of the character that is speaking.
     */
    characterId?: string
}
