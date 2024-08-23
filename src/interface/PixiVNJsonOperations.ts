import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import { PixiVNJsonCanvas, PixiVNJsonSound } from "./PixiVNJsonMedia"
import { PixiVNJsonStorageSet } from "./PixiVNJsonValue"

export type PixiVNJsonOperation = PixiVNJsonStorageSet | PixiVNJsonCanvas | PixiVNJsonSound

type PixiVNJsonOperations = (PixiVNJsonOperation | PixiVNJsonIfElse<PixiVNJsonOperation>)[]

export default PixiVNJsonOperations
