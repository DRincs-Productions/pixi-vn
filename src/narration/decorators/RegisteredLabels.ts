import CachedMap from "@classes/CachedMap";
import type Label from "@narration/classes/Label";
import type LabelAbstract from "@narration/classes/LabelAbstract";
import type { LabelIdType } from "@narration/types/LabelIdType";
import { logger } from "@utils/log-utility";

/**
 * A Map that contains all labels registered and available to be used.
 * The key is the id of the label and the value is the label itself.
 */
const registeredLabels = new CachedMap<LabelIdType, LabelAbstract<any> | Label<any>>({
    cacheSize: 10,
});

namespace RegisteredLabels {
    /**
     * Gets a label by its id
     * @param id The id of the label
     * @returns The label or undefined if it does not exist
     */
    export function get<T = LabelAbstract<any>, T2 extends LabelIdType | string = LabelIdType>(
        id: T2,
    ): T | undefined {
        const label = registeredLabels.get(id);
        if (!label) {
            logger.error(`Label "${id}" not found`);
            return;
        }
        return label as T;
    }

    /**
     * Saves a label in the system
     * @param labels The label(s) to be saved
     */
    export function add(...labels: (LabelAbstract<any, any> )[]) {
        for (const label of labels) {
            if (registeredLabels.has(label.id)) {
                logger.info(`Label "${label.id}" already exists, it will be overwritten`);
            }
            registeredLabels.set(label.id, label);
        }
    }

    /**
     * Get a list of all labels registered.
     * @returns An array of labels.
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

    /**
     * Get a list of all label ids registered.
     * @returns An array of label ids.
     */
    export function keys(): LabelIdType[] {
        return Array.from(registeredLabels.keys());
    }

    /**
     * Removes all registered labels.
     */
    export function clear(): void {
        registeredLabels.clear();
    }
}
export default RegisteredLabels;
