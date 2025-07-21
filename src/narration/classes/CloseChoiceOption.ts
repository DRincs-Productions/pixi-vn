import { ChoiceInterface } from "@drincs/pixi-vn";
import { CloseChoiceOptionInterface } from "../interfaces/StoredChoiceInterface";
import { Close } from "../types/CloseType";

interface ChoiceMenuOptionCloseOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * If true, the current label will be closed. @default false
     */
    closeCurrentLabel?: boolean;
}

/**
 * Function to create a new choice menu option that will close the menu.
 * @example
 * ```typescript
 * newCloseChoiceOption("Return")
 * ```
 */
export function newCloseChoiceOption(
    text: ChoiceInterface["text"],
    options?: ChoiceMenuOptionCloseOptions
): CloseChoiceOptionInterface {
    return {
        ...options,
        type: Close,
        text,
    };
}
