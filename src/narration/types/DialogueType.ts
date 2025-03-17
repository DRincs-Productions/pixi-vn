import { StorageElementType } from "../../types/StorageElementType";

type DialogueType = {
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
export default DialogueType;
