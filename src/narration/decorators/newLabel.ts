import Label from "../classes/Label";
import type LabelProps from "../interfaces/LabelProps";
import type { LabelIdType } from "../types/LabelIdType";
import type LabelSteps from "../types/LabelSteps";
import RegisteredLabels from "./RegisteredLabels";

/**
 * Creates a new label and registers it in the system.
 * **This function must be called at least once at system startup to register the label, otherwise the system cannot be used.**
 * @param id A unique identifier. Used to reference the `label` in the game (must be unique).
 * @param steps An array of functions to be executed in order. To create a dynamic array.
 * @param props An object with the `label`'s options
 * @returns The created label
 */
export default function newLabel<T extends {} = {}>(
    id: LabelIdType,
    steps: LabelSteps<T> | (() => LabelSteps<T>),
    props?: LabelProps<Label<T>>,
): Label<T> {
    const label = new Label<T>(id, steps, props);
    RegisteredLabels.add(label);
    return label;
}
