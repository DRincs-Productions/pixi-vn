import { CachedMap } from "../classes";
import { FLAGS_KEY, TEMP_STORAGE_KEY } from "../constants";
import { createExportableElement } from "../utils/export-utility";
import { StorageElementType } from "./types/StorageElementType";

export default class StorageManagerStatic {
    static storage = new CachedMap<string, any>({ cacheSize: 50 });
    static default = new CachedMap<string, any>({ cacheSize: 10 });
    static tempStorageDeadlines = new Map<string, number>();

    private constructor() {}

    static clearOldTempVariables(openedLabelsNumber: number) {
        StorageManagerStatic.tempStorageDeadlines.forEach((deadline, key) => {
            if (deadline > openedLabelsNumber) {
                StorageManagerStatic.storage.delete(`${TEMP_STORAGE_KEY}${key}`);
                StorageManagerStatic.tempStorageDeadlines.delete(key);
            }
        });
    }

    static setVariable(prefix: string, key: string, value: StorageElementType) {
        if (value === undefined || value === null) {
            StorageManagerStatic.storage.delete(`${prefix}:${key}`);
        } else {
            StorageManagerStatic.storage.set(`${prefix}:${key}`, value);
        }
    }

    static getVariable<T extends StorageElementType>(prefix: string, key: string): T | undefined {
        let result = StorageManagerStatic.storage.get(`${prefix}:${key}`);
        return createExportableElement(result) as T;
    }

    static removeVariable(prefix: string, key: string) {
        StorageManagerStatic.storage.delete(`${prefix}:${key}`);
    }

    static setFlag(key: string, value: boolean) {
        const flags = StorageManagerStatic.storage.get(FLAGS_KEY) || [];
        if (value) {
            if (!flags.includes(key)) {
                flags.push(key);
            }
        } else {
            let index = flags.indexOf(key);
            if (index > -1) {
                flags.splice(index, 1);
            }
        }
        StorageManagerStatic.storage.set(FLAGS_KEY, flags);
    }

    static getFlag(key: string): boolean {
        const flags = StorageManagerStatic.storage.get(FLAGS_KEY) || [];
        return flags.includes(key);
    }
}
