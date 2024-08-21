import PixiVNJsonIfElse from "./PixiVNJsonIfElse";

/**
 * Represents a condition that checks the status of a label.
 */
interface PixiVNJsonLabelCondition<Then> {
    type: "labelcondition",
    /**
     * The condition to be checked.
     */
    condition: "started" | "completed" | "notstarted" | "notcompleted",
    /**
     * The label to be checked.
     */
    label: string,
    /**
     * The value to be returned if the condition is true.
     */
    then: Then | PixiVNJsonLabelCondition<Then>,
    /**
     * The value to be returned if the condition is false.
     */
    else?: Then | PixiVNJsonIfElse<Then>,
}

export default PixiVNJsonLabelCondition
