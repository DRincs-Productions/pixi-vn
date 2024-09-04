import { StorageElementType } from "../types"
import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"
import { PixiVNJsonValueGet } from "./PixiVNJsonValue"

/**
 * Arithmetic operations for the PixiVNJson
 */
type PixiVNJsonArithmeticOperations = {
    type: "arithmetic",
    /**
     * Left value of the arithmetic operation
     */
    leftValue: StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditionalStatements<StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations>,
    /**
     * Right value of the arithmetic operation
     */
    rightValue: StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditionalStatements<StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations>,
    /**
     * Operator of the arithmetic operation
     */
    operator: "*" | "/" | "+" | "-" | "%" | "POW" | "RANDOM"
} | {
    type: "arithmeticsingle",
    /**
     * Left value of the arithmetic operation
     */
    leftValue: StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditionalStatements<StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations>,
    /**
     * Operator of the arithmetic operation
     */
    operator: "INT" | "FLOOR" | "FLOAT"
}

export default PixiVNJsonArithmeticOperations
