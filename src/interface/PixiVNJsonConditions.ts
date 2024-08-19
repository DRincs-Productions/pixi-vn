import { StorageElementType } from "../types"
import { PixiVNJsonStorageGet } from "./PixiVNJsonStorage"

type PixiVNJsonComparation = {
    type: "compare",
    /**
     * Left value of the comparation
     */
    leftValue: StorageElementType | PixiVNJsonStorageGet,
    /**
     * Right value of the comparation
     */
    rightValue: StorageElementType | PixiVNJsonStorageGet,
    /**
     * Operator of the comparation
     */
    operator: "==" | "!=" | "<" | "<=" | ">" | ">=",
}

type PixiVNJsonValueCondition = {
    type: "valueCondition",
    /**
     * Value to check, if it is true, or if it not null or undefined
     */
    value: StorageElementType | PixiVNJsonStorageGet
}

/**
 * Conditions for PixiVNJson
 */
type PixiVNJsonConditions = PixiVNJsonComparation | PixiVNJsonValueCondition

export default PixiVNJsonConditions
