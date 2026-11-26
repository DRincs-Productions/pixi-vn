import type OpenedLabel from "./OpenedLabel";

/**
 * Result of checking an opened-labels stack against the labels currently registered
 * (see `NarrationManagerStatic.validateOpenedLabels`).
 */
export default interface OpenedLabelsValidation {
    /**
     * - `"valid"`: every entry still points to the same step.
     * - `"relocated"`: some steps were moved (steps added or removed before them) and their
     *   `currentStepIndex` was updated in {@link openedLabels}.
     * - `"invalid"`: a label was deleted/renamed, or its current step was changed or removed.
     */
    status: "valid" | "relocated" | "invalid";
    /**
     * The checked stack, with relocated indexes applied (the given stack unchanged when
     * {@link status} is `"invalid"`).
     */
    openedLabels: OpenedLabel[];
}
