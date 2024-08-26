import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"

type PixiVNJsonConditionalResultWithDefaultElement<T> = {
    type: "crwde"
    firstItem?: T | T[]
    secondConditionalItem?: PixiVNJsonConditionalStatements<PixiVNJsonConditionalResultWithDefaultElement<T>[] | PixiVNJsonConditionalResultWithDefaultElement<T>>
}
export default PixiVNJsonConditionalResultWithDefaultElement
