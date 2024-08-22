/**
 * Represents a condition that checks the status of a label.
 */
interface PixiVNJsonLabelCondition {
    type: "labelcondition",
    /**
     * The condition to be checked.
     */
    operator: "started" | "completed",
    /**
     * The label to be checked.
     */
    label: string,
}

export default PixiVNJsonLabelCondition
