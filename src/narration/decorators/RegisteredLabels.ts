import { logger } from "../../utils/log-utility";
import Label from "../classes/Label";
import LabelAbstract from "../classes/LabelAbstract";
import { LabelIdType } from "../types/LabelIdType";

/**
 * A Map that contains all labels registered and available to be used.
 * The key is the id of the label and the value is the label itself.
 */
const registeredLabels = new Map<LabelIdType, LabelAbstract<any> | Label<any>>();

namespace RegisteredLabels {
    /**
     * Gets a label by its id
     * @param id The id of the label
     * @returns The label or undefined if it does not exist
     */
    export function get<T = LabelAbstract<any>>(id: LabelIdType): T | undefined {
        let label = registeredLabels.get(id);
        if (!label) {
            logger.error(`Label ${id} not found`);
            return;
        }
        return label as T;
    }

    /**
     * Saves a label in the system
     * @param label The label to be saved
     */
    export function add(label: LabelAbstract<any, any>) {
        registeredLabels.set(label.id, label);
    }
}
export default RegisteredLabels;
