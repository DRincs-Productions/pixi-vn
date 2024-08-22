import PixiVNJsonConditions from "./PixiVNJsonConditions"

type PixiVNJsonUnionConditionAndOr = {
    type: "union",
    conditions: PixiVNJsonConditions[]
    unionType: "and" | "or"
}
type PixiVNJsonUnionConditionNot = {
    type: "union",
    condition: PixiVNJsonConditions
    unionType: "not"
}
type PixiVNJsonUnionCondition = PixiVNJsonUnionConditionAndOr | PixiVNJsonUnionConditionNot
export default PixiVNJsonUnionCondition
