import { CachedMap } from "../classes";
import { SYSTEM_RESERVED_STORAGE_KEYS } from "../constants";
import { createExportableElement } from "../utils/export-utility";
import { CacheableStoreItem } from "./interfaces/StorageGameState";
import { StorageElementType } from "./types/StorageElementType";

export default class StorageManagerStatic {
    static storage = new CachedMap<string, any>({ cacheSize: 20 });
    static startingStorage: CacheableStoreItem[] = [];
    private constructor() {}

    /**
     * @deprecated Use SYSTEM_RESERVED_STORAGE_KEYS instead
     */
    public static get keysSystem() {
        return SYSTEM_RESERVED_STORAGE_KEYS;
    }

    static tempStorage = new Map<string, StorageElementType>();
    static tempStorageDeadlines = new Map<string, number>();

    static clearOldTempVariables(openedLabelsNumber: number) {
        StorageManagerStatic.tempStorageDeadlines.forEach((deadline, key) => {
            if (deadline > openedLabelsNumber) {
                StorageManagerStatic.tempStorage.delete(key);
                StorageManagerStatic.tempStorageDeadlines.delete(key);
                StorageManagerStatic.storage.cache.delete(key);
            }
        });
    }

    static setVariable(key: string, value: StorageElementType) {
        const isInTempStorage = StorageManagerStatic.tempStorage.has(key);
        if (value === undefined || value === null) {
            StorageManagerStatic.storage.map.delete(key);
            !isInTempStorage && StorageManagerStatic.storage.cache.delete(key);
        } else {
            StorageManagerStatic.storage.map.set(key, value);
            !isInTempStorage && StorageManagerStatic.storage.cache.set(key, value);
        }
    }

    static getVariable<T extends StorageElementType>(key: string): T | undefined {
        let result = StorageManagerStatic.storage.cache.get(key);
        if (result === undefined) {
            result = StorageManagerStatic.tempStorage.get(key);
        }
        if (result === undefined) {
            result = StorageManagerStatic.storage.map.get(key);
        }
        return createExportableElement(result) as T;
    }

    static removeVariable(key: string) {
        StorageManagerStatic.storage.delete(key);
    }

    static setFlag(key: string, value: boolean) {
        let flags = StorageManagerStatic.getVariable<string[]>(SYSTEM_RESERVED_STORAGE_KEYS.FLAGS_CATEGORY_KEY) || [];
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
        StorageManagerStatic.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.FLAGS_CATEGORY_KEY, flags);
    }

    static getFlag(key: string): boolean {
        const flags = StorageManagerStatic.getVariable<string[]>(SYSTEM_RESERVED_STORAGE_KEYS.FLAGS_CATEGORY_KEY) || [];
        return flags.includes(key);
    }
}
