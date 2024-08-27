import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"

/**
 * This element is used in case a {@link PixiVNJsonConditionalStatements} gives a result that must be combined with another calculated through other {@link PixiVNJsonConditionalStatements}.
 * in case this possibility is not managed, it will be taken into consideration {@link PixiVNJsonConditionalResultToCombine.firstItem}
 */
type PixiVNJsonConditionalResultToCombine<T> = {
    type: "resulttocombine"
    /**
     * This variable is interpreted differently by Pixi'VN depending on the value
     */
    combine: "cross" | "union"
    firstItem?: T
    secondConditionalItem?: (PixiVNJsonConditionalResultToCombine<T> | PixiVNJsonConditionalStatements<T>[] | T)[]
}
export default PixiVNJsonConditionalResultToCombine
