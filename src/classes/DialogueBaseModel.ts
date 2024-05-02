import CharacterBaseModel from "./CharacterBaseModel"

/**
 * Base class for all dialogue models. I suggest you extend this class to create your own dialogue models.
 */
export default class DialogueBaseModel {
    constructor(text: string, character: string | CharacterBaseModel | undefined) {
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
