import PixiVNJsonLabels from "./PixiVNJsonLabels"
import PixiVNJsonOperations from "./PixiVNJsonOperations"

/**
 * PixiVNJson It can be defined as a programming language to write a narrative written in json.
 */
export default interface PixiVNJson {
    /**
     * The operations to be executed before the narrative starts.
     * For the set storage: They will be set only if there are no variables with the same key already.
     * For the det tempstorage: if there are variables with the same key already, they will be overwritten.
     */
    initialOperations?: PixiVNJsonOperations
    /**
     * The labels to be used in the narrative. They will be added to the system
     */
    labels?: PixiVNJsonLabels
}
