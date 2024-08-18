import DialogueInterface from "../override/DialogueInterface"
import { StorageElementType } from "../types"

export default interface DialogueData extends DialogueInterface {
    /**
     * The text of the dialogue.
     */
    text: string
    /**
     * The id of the character that is speaking.
     */
    character?: string
    /**
     * Other parameters that can be stored in the dialogue.
     */
    oltherParams?: Record<string | number | symbol, StorageElementType>
} 
