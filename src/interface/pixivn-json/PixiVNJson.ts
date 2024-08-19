import LabelJsonType from "./LabelJsonType"
import { SetFlagStorageJsonType, SetStorageJsonType } from "./StorageJsonType"

/**
 * PixiVNJson It can be defined as a programming language to write a narrative written in json.
 */
export default interface PixiVNJson {
    /**
     * The initial variables are added to the system when this json is loaded.
     * They will be set only if there are no variables with the same key already.
     */
    initialVariables?: (SetStorageJsonType | SetFlagStorageJsonType)[]
    /**
     * The labels to be used in the narrative. They will be added to the system
     */
    labels?: LabelJsonType
}
