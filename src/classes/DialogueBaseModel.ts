/**
 * Base class for all dialogue models. I suggest you extend this class to create your own dialogue models.
 */
export default class DialogueBaseModel {
    constructor(text: string, characterId: string | undefined) {
        this.text = text
        this.characterId = characterId
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
