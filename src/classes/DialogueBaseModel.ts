import { StorageElementType } from "../types"
import CharacterBaseModel from "./CharacterBaseModel"

export type DialogueData = {
    /**
     * The text of the dialogue.
     */
    text: string
    /**
     * The id of the character that is speaking.
     */
    characterId?: string
    /**
     * Other parameters that can be stored in the dialogue.
     */
    oltherParams?: Record<string | number | symbol, StorageElementType>
}

/**
 * Base class for all dialogue models.
 * You can extend this class, but it is not reccomended. You can use the oltherParams property to store any other data you need.
 * @example
 * ```typescript
 * setDialogue(new DialogueBaseModel("Hello World", character))
 * ```
 */
export default class DialogueBaseModel<TCharacter extends CharacterBaseModel = CharacterBaseModel> implements DialogueData {
    /**
     * @param text The text of the dialogue.
     * @param character The id of the character that is speaking. 
     * @param oltherParams Other parameters that can be stored in the dialogue.
     */
    constructor(text: string | DialogueData, character?: string | TCharacter, oltherParams: { [key: string]: StorageElementType } = {}) {
        if (typeof text === "string") {
            this.text = text
            if (typeof character === "string") {
                this.characterId = character
            }
            else {
                this.characterId = character?.id
            }
            this.oltherParams = oltherParams
        }
        else {
            this.text = text.text
            if (text.characterId) {
                this.characterId = text.characterId
            }
            this.oltherParams = text.oltherParams || {}
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
    /**
     * Other parameters that can be stored in the dialogue.
     */
    oltherParams: { [key: string]: StorageElementType } = {}
    /**
     * Export the dialogue to a DialogueBaseData object.
     * 
     * @returns The data of the dialogue.
     */
    export(): DialogueData {
        return {
            text: this.text,
            characterId: this.characterId,
            oltherParams: this.oltherParams
        }
    }
}
