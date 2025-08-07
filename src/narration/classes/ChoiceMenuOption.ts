import { ChoiceInterface } from "@drincs/pixi-vn";
import { StorageObjectType } from "../../storage";
import { ChoiceOptionInterface } from "../interfaces/StoredChoiceInterface";
import { LabelIdType } from "../types/LabelIdType";
import LabelRunModeType from "../types/LabelRunModeType";
import Label from "./Label";
import LabelAbstract from "./LabelAbstract";

interface ChoiceMenuOptionOptions
    extends Omit<ChoiceInterface, "text" | "label" | "type" | "props" | "closeCurrentLabel"> {
    /**
     * Type of the label to be opened. @default "call"
     */
    type?: LabelRunModeType;
}

/**
 * Function to create a new choice menu option.
 * @example
 * ```typescript
 * newChoiceOption("Hello", HelloLabel, {})
 * ```
 */
export function newChoiceOption<T extends StorageObjectType>(
    text: ChoiceInterface["text"],
    label: Label<T> | LabelAbstract<any, T> | LabelIdType,
    props: T,
    options?: ChoiceMenuOptionOptions
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
