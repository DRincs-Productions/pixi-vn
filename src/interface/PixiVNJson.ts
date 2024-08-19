import PixiVNJsonLabels from "./PixiVNJsonLabels"
import { PixiVNJsonStorageSet } from "./PixiVNJsonStorage"

/**
 * PixiVNJson It can be defined as a programming language to write a narrative written in json.
 */
export default interface PixiVNJson {
    /**
     * The initial variables are added to the system when this json is loaded.
     * They will be set only if there are no variables with the same key already.
     */
    initialVariables?: PixiVNJsonStorageSet[]
    /**
     * The variables are added to the system when this json is loaded.
     * if there are variables with the same key already, they will be overwritten.
     * This solution corresponds to the **constants**.
     */
    constants?: PixiVNJsonStorageSet[]
    /**
     * The labels to be used in the narrative. They will be added to the system
     */
    labels?: PixiVNJsonLabels
}
