/**
 * Base class for all dialogue models. I suggest you extend this class to create your own dialogue models.
 */
export class DialogueModelBase {
    constructor(text: string) {
        this.text = text
    }
    text: string = ""
}
