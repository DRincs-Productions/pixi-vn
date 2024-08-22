import { StorageElementType } from "../types"
import PixiVNJsonLabelCondition from "./PixiVNJsonLabelCondition"
import { PixiVNJsonStorageGet } from "./PixiVNJsonStorage"
import PixiVNJsonUnionCondition from "./PixiVNJsonUnionCondition"

/**
 * Comparation for PixiVNJson.
 * In this comparation, the values to be converted to string and compared.
 */
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
type PixiVNJsonConditions = PixiVNJsonComparation | PixiVNJsonValueCondition | PixiVNJsonUnionCondition | PixiVNJsonLabelCondition

export default PixiVNJsonConditions
