import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import { PixiVNJsonCanvas, PixiVNJsonSound } from "./PixiVNJsonMedia"
import { PixiVNJsonValueSet } from "./PixiVNJsonValue"

export type PixiVNJsonOperation = PixiVNJsonValueSet | PixiVNJsonCanvas | PixiVNJsonSound

type PixiVNJsonOperations = (PixiVNJsonOperation | PixiVNJsonIfElse<PixiVNJsonOperation>)[]

export default PixiVNJsonOperations
