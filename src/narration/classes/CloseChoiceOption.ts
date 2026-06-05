import type { ChoiceInterface } from "@drincs/pixi-vn";
import type { CloseChoiceOptionInterface } from "../interfaces/StoredChoiceInterface";
import { Close } from "../types/CloseType";

interface ChoiceMenuOptionCloseOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * IIf `true`, the current `label` will be closed.
     * @default false
     */
    closeCurrentLabel?: boolean;
}

/**
 * In addition to `newChoiceOption`, you can use `newCloseChoiceOption` to create a closing option.
 * This closes the choice menu and continues with the `steps`, without calling any `label`.
 * @param text The text displayed in the choice menu.
 * @param options An object with the `choice`'s options
 * @example
 * ```ts
 * newCloseChoiceOption("Return")
 * ```
 */
export function newCloseChoiceOption(
    text: ChoiceInterface["text"],
    options?: ChoiceMenuOptionCloseOptions,
): CloseChoiceOptionInterface {
    return {
        ...options,
        type: Close,
        text,
    };
}
