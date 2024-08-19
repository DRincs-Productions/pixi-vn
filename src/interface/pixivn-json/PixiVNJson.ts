import { LabelJsonType, SetFlagStorageJsonType, SetStorageJsonType } from "../types";

/**
 * PixiVNJson It can be defined as a programming language to write a narrative written in json.
 */
export default interface PixiVNJson {
    initialVariables?: (SetStorageJsonType | SetFlagStorageJsonType)[]
    labels?: LabelJsonType
}
