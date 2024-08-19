import PixiVNJsonConditions from "./PixiVNJsonConditions";
import PixiVNJsonUnionCondition from "./PixiVNJsonUnionCondition";

/**
 * If-Else condition for PixiVNJson
 */
interface PixiVNJsonIfElse<Then> {
    type: "ifElse",
    /**
     * The list of conditions to be checked.
     */
    condition: PixiVNJsonConditions | PixiVNJsonUnionCondition,
    /**
     * The value to be returned if the condition is true.
     */
    then: Then | PixiVNJsonIfElse<Then>,
    /**
     * The value to be returned if the condition is false.
     */
    else?: Then | PixiVNJsonIfElse<Then>,
}

export default PixiVNJsonIfElse
