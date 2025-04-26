import { SYSTEM_RESERVED_STORAGE_KEYS } from "../constants";
import GameUnifier from "../unifier";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
import StorageGameState, { CacheableStoreItem } from "./interfaces/StorageGameState";
import StorageManagerInterface from "./interfaces/StorageManagerInterface";
import StorageManagerStatic from "./StorageManagerStatic";
import { StorageElementType } from "./types/StorageElementType";

export default class StorageManager implements StorageManagerInterface {
    get storage() {
        return StorageManagerStatic.storage.map;
    }
    get cache() {
        return StorageManagerStatic.storage.cache;
    }
    /**
     * @deprecated Use SYSTEM_RESERVED_STORAGE_KEYS instead
     */
    get keysSystem() {
        return SYSTEM_RESERVED_STORAGE_KEYS;
    }
    set startingStorage(value: { [key: string]: StorageElementType }) {
        let data: CacheableStoreItem[] = [];
        Object.entries(value).forEach(([key, value]) => {
            data.push({ key, value: value });
        });
        StorageManagerStatic.startingStorage = data;
    }
    public setVariable(key: string, value: StorageElementType) {
        return StorageManagerStatic.setVariable(key, value);
    }
    public getVariable<T extends StorageElementType>(key: string): T | undefined {
        return StorageManagerStatic.getVariable<T>(key);
    }
    public removeVariable(key: string) {
        return StorageManagerStatic.removeVariable(key);
    }
    public setTempVariable(key: string, value: StorageElementType) {
        if (value === undefined || value === null) {
            this.removeTempVariable(key);
            return;
        } else {
            StorageManagerStatic.tempStorage.set(key, value);
            StorageManagerStatic.storage.cache.set(key, value);
            if (!StorageManagerStatic.tempStorageDeadlines.has(key)) {
                StorageManagerStatic.tempStorageDeadlines.set(key, GameUnifier.openedLabels);
            }
        }
    }
    public removeTempVariable(key: string) {
        if (StorageManagerStatic.tempStorage.has(key)) {
            StorageManagerStatic.tempStorage.delete(key);
            StorageManagerStatic.tempStorageDeadlines.delete(key);
            StorageManagerStatic.storage.cache.delete(key);
        }
    }
    setFlag(key: string, value: boolean) {
        return StorageManagerStatic.setFlag(key, value);
    }
    getFlag(key: string): boolean {
        return StorageManagerStatic.getFlag(key);
    }
    public clear() {
        this.storage.clear();
        this.cache.clear();
        StorageManagerStatic.tempStorage.clear();
        StorageManagerStatic.tempStorageDeadlines.clear();
        StorageManagerStatic.startingStorage.forEach(({ key, value }) => {
            this.storage.set(key, value);
        });
    }
    public export(): StorageGameState {
        let base: CacheableStoreItem[] = [];
        [...this.storage.keys()].forEach((key) => {
            base.push({ key, value: this.storage.get(key) });
        });
        let temp: CacheableStoreItem[] = [];
        [...StorageManagerStatic.tempStorage.keys()].forEach((key) => {
            temp.push({ key, value: StorageManagerStatic.tempStorage.get(key) });
        });
        let tempDeadlines: CacheableStoreItem<number>[] = [];
        [...StorageManagerStatic.tempStorageDeadlines.keys()].forEach((key) => {
            tempDeadlines.push({ key, value: StorageManagerStatic.tempStorageDeadlines.get(key)! });
        });
        return createExportableElement({
            base,
            temp,
            tempDeadlines,
        });
    }
    public restore(data: StorageGameState) {
        this.clear();
        try {
            if (data) {
                // id data is array
                // deprecated
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        this.storage.set(item.key, item.value);
                    });
                }
                if ("base" in data && "temp" in data && "tempDeadlines" in data) {
                    (data.base as any)?.forEach((item: CacheableStoreItem) => {
                        this.storage.set(item.key, item.value);
                    });
                    (data.temp as any)?.forEach((item: CacheableStoreItem) => {
                        StorageManagerStatic.tempStorage.set(item.key, item.value);
                    });
                    (data.tempDeadlines as any)?.forEach((item: CacheableStoreItem<number>) => {
                        StorageManagerStatic.tempStorageDeadlines.set(item.key, item.value);
                    });
                }
                // if data is object
                // deprecated
                else {
                    Object.entries(data).forEach(([key, value]) => {
                        this.storage.set(key, value);
                    });
                }
            } else {
                logger.warn("No storage data found");
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
