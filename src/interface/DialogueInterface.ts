import DialogueInterface from "../override/DialogueInterface"
import { StorageElementType } from "../types"

type DialogueData = {
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
} & DialogueInterface
export default DialogueData
