import { logger } from "../../utils/log-utility";
import Label from "../classes/Label";
import LabelProps from "../interfaces/LabelProps";
import { LabelIdType } from "../types/LabelIdType";
import { StepLabelType } from "../types/StepLabelType";
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
    steps: StepLabelType<T>[] | (() => StepLabelType<T>[]),
    props?: LabelProps<Label<T>>
): Label<T> {
    if (RegisteredLabels.get(id)) {
        logger.info(`Label ${id} already exists, it will be overwritten`);
    }
    let label = new Label<T>(id, steps, props);
    RegisteredLabels.add(label);
    return label;
}
