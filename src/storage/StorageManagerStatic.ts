import { CachedMap } from "../classes";
import { FLAGS_KEY, TEMP_STORAGE_KEY } from "../constants";
import { createExportableElement } from "../utils/export-utility";
import type { StorageElementType } from "./types/StorageElementType";

namespace StorageManagerStatic {
    export const storage = new CachedMap<string, any>({ cacheSize: 50 });
    export const defaultValues = new CachedMap<string, any>({ cacheSize: 10 });
    export const tempStorageDeadlines = new Map<string, number>();

    export function clearOldTempVariables(openedLabelsNumber: number) {
        tempStorageDeadlines.forEach((deadline, key) => {
            if (deadline > openedLabelsNumber) {
                removeVariable(TEMP_STORAGE_KEY, key);
                tempStorageDeadlines.delete(key);
            }
        });
    }

    export function setVariable(prefix: string, key: string, value: StorageElementType) {
        if (value === undefined || value === null) {
            storage.delete(`${prefix}:${key}`);
        } else {
            storage.set(`${prefix}:${key}`, value);
        }
    }

    export function getVariable<T = StorageElementType>(prefix: string, key: string): T | undefined {
        const result = storage.get(`${prefix}:${key}`);
        return createExportableElement(result) as T;
    }

    export function removeVariable(prefix: string, key: string) {
        storage.delete(`${prefix}:${key}`);
    }

    export function setFlag(key: string, value: boolean) {
        const flags = storage.get(FLAGS_KEY) || [];
        if (value) {
            if (!flags.includes(key)) {
                flags.push(key);
            }
        } else {
            const index = flags.indexOf(key);
            if (index > -1) {
                flags.splice(index, 1);
            }
        }
        storage.set(FLAGS_KEY, flags);
    }

    export function getFlag(key: string): boolean {
        const flags = storage.get(FLAGS_KEY) || [];
        return flags.includes(key);
    }
}
export default StorageManagerStatic;
