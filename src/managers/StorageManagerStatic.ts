import { SYSTEM_RESERVED_STORAGE_KEYS } from "../constants";
import { createExportableElement } from "../functions/export-utility";
import { CacheableStoreItem } from "../interface/export/ExportedStorage";
import { StorageElementType } from "../types/StorageElementType";

export default class StorageManagerStatic {
    static storage = new Map<string, any>();
    static startingStorage: CacheableStoreItem[] = [];
    private constructor() {}
    /**
     * @deprecated Use SYSTEM_RESERVED_STORAGE_KEYS instead
     */
    public static get keysSystem() {
        return SYSTEM_RESERVED_STORAGE_KEYS;
    }
    static get tempStorage(): { [key: string]: StorageElementType } {
        return StorageManagerStatic.storage.get(StorageManagerStatic.keysSystem.TEMP_STORAGE_KEY) || {};
    }
    static set tempStorage(value: { [key: string]: StorageElementType }) {
        StorageManagerStatic.storage.set(StorageManagerStatic.keysSystem.TEMP_STORAGE_KEY, value);
    }
    static get tempStorageDeadlines(): { [key: string]: number } {
        return StorageManagerStatic.storage.get(StorageManagerStatic.keysSystem.TEMP_STORAGE_DEADLINES_KEY) || {};
    }
    static set tempStorageDeadlines(value: { [key: string]: number }) {
        StorageManagerStatic.storage.set(StorageManagerStatic.keysSystem.TEMP_STORAGE_DEADLINES_KEY, value);
    }
    static getTempVariable<T extends StorageElementType>(key: string): T | undefined {
        if (StorageManagerStatic.tempStorage.hasOwnProperty(key)) {
            return createExportableElement(StorageManagerStatic.tempStorage[key]) as T;
        }
        return undefined;
    }
    static clearOldTempVariables(openedLabelsNumber: number) {
        let tempStorage = StorageManagerStatic.tempStorage;
        let tempStorageDeadlines = StorageManagerStatic.tempStorageDeadlines;
        if (openedLabelsNumber === 0) {
            tempStorage = {};
            tempStorageDeadlines = {};
        } else {
            for (const key in tempStorageDeadlines) {
                if (tempStorageDeadlines[key] < openedLabelsNumber) {
                    delete tempStorage[key];
                    delete tempStorageDeadlines[key];
                }
            }
        }
        StorageManagerStatic.tempStorage = tempStorage;
        StorageManagerStatic.tempStorageDeadlines = tempStorageDeadlines;
    }
    static setVariable(key: string, value: StorageElementType) {
        // TODO this if should be removed in some other version
        if (StorageManagerStatic.storage.has(key.toLowerCase())) {
            StorageManagerStatic.storage.delete(key.toLowerCase());
        }
        if (value === undefined || value === null) {
            StorageManagerStatic.storage.delete(key);
            return;
        }
        StorageManagerStatic.storage.set(key, value);
    }
    static getVariable<T extends StorageElementType>(key: string): T | undefined {
        let tempVariable = StorageManagerStatic.getTempVariable<T>(key);
        if (tempVariable !== undefined) {
            return tempVariable;
        }
        // TODO this if should be removed in some other version
        if (!StorageManagerStatic.storage.has(key) && StorageManagerStatic.storage.has(key.toLowerCase())) {
            key = key.toLowerCase();
        }
        return createExportableElement(StorageManagerStatic.storage.get(key));
    }
    static removeVariable(key: string) {
        // TODO this if should be removed in some other version
        if (!StorageManagerStatic.storage.has(key) && StorageManagerStatic.storage.has(key.toLowerCase())) {
            key = key.toLowerCase();
        }
        StorageManagerStatic.storage.delete(key);
    }
    static setFlag(name: string, value: boolean) {
        let flags =
            StorageManagerStatic.getVariable<string[]>(StorageManagerStatic.keysSystem.FLAGS_CATEGORY_KEY) || [];
        if (value) {
            if (!flags.includes(name)) {
                flags.push(name);
            }
        } else {
            let index = flags.indexOf(name);
            if (index > -1) {
                flags.splice(index, 1);
            }
        }
        StorageManagerStatic.setVariable(StorageManagerStatic.keysSystem.FLAGS_CATEGORY_KEY, flags);
    }
    static getFlag(name: string): boolean {
        let flags =
            StorageManagerStatic.getVariable<string[]>(StorageManagerStatic.keysSystem.FLAGS_CATEGORY_KEY) || [];
        return flags.includes(name);
    }
}
