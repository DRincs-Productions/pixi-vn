import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"
import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import { PixiVNJsonInput } from "./PixiVNJsonInput"
import { PixiVNJsonCanvas, PixiVNJsonSound } from "./PixiVNJsonMedia"
import { PixiVNJsonValueGet, PixiVNJsonValueSet } from "./PixiVNJsonValue"

export type PixiVNJsonOperationString = {
    type: "oprationtoconvert",
    values: (string | PixiVNJsonValueGet | PixiVNJsonConditionalStatements<string | PixiVNJsonValueGet>)[]
}

export type PixiVNJsonOperation = PixiVNJsonValueSet | PixiVNJsonCanvas | PixiVNJsonSound | PixiVNJsonInput

type PixiVNJsonOperations = (PixiVNJsonOperation | PixiVNJsonIfElse<PixiVNJsonOperation> | PixiVNJsonOperationString)[]

export default PixiVNJsonOperations
