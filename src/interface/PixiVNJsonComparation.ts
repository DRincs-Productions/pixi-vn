import { StorageElementType } from "../types"
import { PixiVNJsonStorageGet } from "./PixiVNJsonStorage"

type PixiVNJsonComparation = {
    type: "compare",
    leftValue: StorageElementType | PixiVNJsonStorageGet,
    rightValue: StorageElementType | PixiVNJsonStorageGet,
    operator: "==" | "!=" | "<" | "<=" | ">" | ">=",
}

export default PixiVNJsonComparation
