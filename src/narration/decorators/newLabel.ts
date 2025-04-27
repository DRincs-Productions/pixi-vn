import Label from "../classes/Label";
import LabelProps from "../interfaces/LabelProps";
import { LabelIdType } from "../types/LabelIdType";
import LabelSteps from "../types/LabelSteps";
import RegisteredLabels from "./RegisteredLabels";

/**
 * Creates a new label and registers it in the system.
 * **This function must be called at least once at system startup to register the label, otherwise the system cannot be used.**
 * @param id The id of the label, it must be unique
 * @param steps The steps of the label
 * @param props The properties of the label
 * @returns The created label
 */
export default function newLabel<T extends {} = {}>(
    id: LabelIdType,
    steps: LabelSteps<T> | (() => LabelSteps<T>),
    props?: LabelProps<Label<T>>
): Label<T> {
    let label = new Label<T>(id, steps, props);
    RegisteredLabels.add(label);
    return label;
}
