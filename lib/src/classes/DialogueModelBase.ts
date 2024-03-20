/**
 * Base class for all dialogue models. I suggest you extend this class to create your own dialogue models.
 */
export default class DialogueModelBase {
    constructor(text: string, characterTag: string | undefined) {
        this.text = text
        this.characterTag = characterTag
    }
    /**
     * The text of the dialogue.
     */
    text: string = ""
    /**
     * The tag of the character that is speaking.
     */
    characterTag?: string
}
