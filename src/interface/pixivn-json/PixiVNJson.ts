import LabelJsonType from "./LabelJsonType"
import { SetFlagStorageJsonType } from "./StorageJsonType"

/**
 * PixiVNJson It can be defined as a programming language to write a narrative written in json.
 */
export default interface PixiVNJson {
    initialVariables?: (| SetFlagStorageJsonType)[]
    labels?: LabelJsonType
}
