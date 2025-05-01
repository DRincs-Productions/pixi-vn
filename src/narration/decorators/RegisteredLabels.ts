import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";
import Label from "../classes/Label";
import LabelAbstract from "../classes/LabelAbstract";
import { LabelIdType } from "../types/LabelIdType";

/**
 * A Map that contains all labels registered and available to be used.
 * The key is the id of the label and the value is the label itself.
 */
const registeredLabels = new CachedMap<LabelIdType, LabelAbstract<any> | Label<any>>({ cacheSize: 10 });

namespace RegisteredLabels {
    /**
     * Gets a label by its id
     * @param id The id of the label
     * @returns The label or undefined if it does not exist
     */
    export function get<T = LabelAbstract<any>>(id: LabelIdType): T | undefined {
        let label = registeredLabels.get(id);
        if (!label) {
            logger.error(`Label "${id}" not found`);
            return;
        }
        return label as T;
    }

    /**
     * Saves a label in the system
     * @param label The label to be saved
     */
    export function add(label: LabelAbstract<any, any> | LabelAbstract<any, any>[]) {
        if (Array.isArray(label)) {
            label.forEach((l) => add(l));
            return;
        }
        if (registeredLabels.has(label.id)) {
            logger.info(`Label "${label.id}" already exists, it will be overwritten`);
        }
        registeredLabels.set(label.id, label);
    }

    /**
     * Get a list of all labels registered.
     * @returns An array of labels.
     * @example
     */
    export function values(): LabelAbstract<any>[] {
        return Array.from(registeredLabels.values());
    }

    /**
     * Check if a label is registered
     * @param id The id of the label
     * @returns True if the label is registered, false otherwise
     */
    export function has(id: string): boolean {
        return registeredLabels.has(id);
    }
}
export default RegisteredLabels;
