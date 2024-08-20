import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import { PixiVNJsonCanvas, PixiVNJsonSound } from "./PixiVNJsonMedia"
import { PixiVNJsonStorageSet } from "./PixiVNJsonStorage"

export type PixiVNJsonOperation = PixiVNJsonStorageSet | PixiVNJsonCanvas | PixiVNJsonSound

type PixiVNJsonOperations = (PixiVNJsonOperation | PixiVNJsonIfElse<PixiVNJsonOperation>)[]

export default PixiVNJsonOperations
