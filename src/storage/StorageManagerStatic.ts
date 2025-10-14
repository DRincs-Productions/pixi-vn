import { CachedMap } from "../classes";
import { createExportableElement } from "../utils/export-utility";
import { StorageElementType } from "./types/StorageElementType";

export default class StorageManagerStatic {
    static storage = new CachedMap<string, any>({ cacheSize: 20 });
    static startingStorage = new CachedMap<string, any>({ cacheSize: 20 });
    static flags = Array<string>();
    static tempStorage = new Map<string, StorageElementType>();
    static tempStorageDeadlines = new Map<string, number>();

    private constructor() {}

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
        if (result === undefined) {
            result = StorageManagerStatic.startingStorage.get(key);
        }
        return createExportableElement(result) as T;
    }

    static removeVariable(key: string) {
        StorageManagerStatic.storage.delete(key);
    }

    static setFlag(key: string, value: boolean) {
        if (value) {
            if (!this.flags.includes(key)) {
                this.flags.push(key);
            }
        } else {
            let index = this.flags.indexOf(key);
            if (index > -1) {
                this.flags.splice(index, 1);
            }
        }
    }

    static getFlag(key: string): boolean {
        return this.flags.includes(key);
    }
}
