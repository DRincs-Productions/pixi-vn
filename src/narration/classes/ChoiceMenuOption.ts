import type { ChoiceInterface } from "@drincs/pixi-vn";
import type { StorageObjectType } from "../../storage";
import type { ChoiceOptionInterface } from "../interfaces/StoredChoiceInterface";
import type { LabelIdType } from "../types/LabelIdType";
import type LabelRunModeType from "../types/LabelRunModeType";
import type Label from "./Label";
import type LabelAbstract from "./LabelAbstract";

interface ChoiceMenuOptionOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * How the `label` will be performed. Can be `call` or `jump`.
     * @default "call"
     */
    type?: LabelRunModeType;
}

/**
 * Function to create a new choice menu option.
 * @param text The text displayed in the choice menu.
 * @param label The `label` to call when the player selects the option.
 * @param props The properties passed to the `label`. If the `label` does not require parameters, pass an empty object `{}`.
 * @param options An object with the `choice`'s options
 * @example
 * ```ts
 * newChoiceOption("Hello", HelloLabel, {})
 * ```
 */
export function newChoiceOption<T extends StorageObjectType>(
    text: ChoiceInterface["text"],
    label: Label<T> | LabelAbstract<any, T> | LabelIdType,
    props: T,
    options?: ChoiceMenuOptionOptions,
): ChoiceOptionInterface {
    const labelId = typeof label === "string" ? label : label.id;
    return {
        ...options,
        label: labelId,
        props: props,
        text,
        type: options?.type || "call",
    };
}
