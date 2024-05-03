import { StorageElementType } from "../types"
import CharacterBaseModel from "./CharacterBaseModel"

/**
 * Base class for all dialogue models.
 * @example
 * ```typescript
 * setDialogue(new DialogueBaseModel("Hello World", character))
 * ```
 */
export default class DialogueBaseModel<TCharacter extends CharacterBaseModel = CharacterBaseModel> {
    /**
     * @param text The text of the dialogue.
     * @param character The id of the character that is speaking. 
     * @param oltherParams Other parameters that can be stored in the dialogue.
     */
    constructor(text: string, character: string | TCharacter | undefined, oltherParams: { [key: string]: StorageElementType } = {}) {
        this.text = text
        if (typeof character === "string") {
            this.characterId = character
        }
        else {
            this.characterId = character?.id
        }
        this.oltherParams = oltherParams
    }
    /**
     * The text of the dialogue.
     */
    text: string = ""
    /**
     * The id of the character that is speaking.
     */
    characterId?: string
    /**
     * Other parameters that can be stored in the dialogue.
     */
    oltherParams: { [key: string]: StorageElementType } = {}
}
