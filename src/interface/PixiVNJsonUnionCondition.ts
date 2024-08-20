import PixiVNJsonConditions from "./PixiVNJsonConditions"

type PixiVNJsonUnionCondition = {
    type: "union",
    conditions: PixiVNJsonConditions[]
    unionType: "and" | "or" | "not"
}

export default PixiVNJsonUnionCondition
