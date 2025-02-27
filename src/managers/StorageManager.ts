import { createExportableElement } from "../functions/export-utility";
import { logger } from "../functions/log-utility";
import { ExportedStorage, NarrationManagerInterface, StorageManagerInterface } from "../interface";
import { CacheableStoreItem } from "../interface/export/ExportedStorage";
import { StorageElementType } from "../types/StorageElementType";
import StorageManagerStatic from "./StorageManagerStatic";

export default class StorageManager implements StorageManagerInterface {
    constructor(private readonly narration: NarrationManagerInterface) {}
    get storage() {
        return StorageManagerStatic.storage;
    }
    get keysSystem() {
        return StorageManagerStatic.keysSystem;
    }
    set startingStorage(value: { [key: string]: StorageElementType }) {
        let data: CacheableStoreItem[] = [];
        Object.entries(value).forEach(([key, value]) => {
            data.push({ key, value: value });
        });
        StorageManagerStatic.startingStorage = data;
    }
    public setVariable(key: string, value: StorageElementType) {
        // TODO this if should be removed in some other version
        if (this.storage.has(key.toLowerCase())) {
            this.storage.delete(key.toLowerCase());
        }
        if (value === undefined || value === null) {
            this.storage.delete(key);
            return;
        }
        this.storage.set(key, value);
    }
    public getVariable<T extends StorageElementType>(key: string): T | undefined {
        let tempVariable = StorageManagerStatic.getTempVariable<T>(key);
        if (tempVariable !== undefined) {
            return tempVariable;
        }
        // TODO this if should be removed in some other version
        if (!this.storage.has(key) && this.storage.has(key.toLowerCase())) {
            key = key.toLowerCase();
        }
        return createExportableElement(this.storage.get(key));
    }
    public removeVariable(key: string) {
        // TODO this if should be removed in some other version
        if (!this.storage.has(key) && this.storage.has(key.toLowerCase())) {
            key = key.toLowerCase();
        }
        this.storage.delete(key);
    }
    public setTempVariable(key: string, value: StorageElementType) {
        let tempStorage = StorageManagerStatic.tempStorage;
        let tempStorageDeadlines = StorageManagerStatic.tempStorageDeadlines;
        // TODO this if should be removed in some other version
        let tempVariable = StorageManagerStatic.getTempVariable(key.toLowerCase());
        if (tempVariable !== undefined) {
            this.removeTempVariable(key.toLowerCase());
        }
        if (value === undefined || value === null) {
            this.removeTempVariable(key);
            return;
        } else {
            tempStorage[key] = value;
            if (!tempStorageDeadlines.hasOwnProperty(key)) {
                tempStorageDeadlines[key] = this.narration.openedLabels.length;
            }
        }
        StorageManagerStatic.tempStorage = tempStorage;
        StorageManagerStatic.tempStorageDeadlines = tempStorageDeadlines;
    }
    public removeTempVariable(key: string) {
        let tempStorage = StorageManagerStatic.tempStorage;
        let tempStorageDeadlines = StorageManagerStatic.tempStorageDeadlines;
        // TODO this if should be removed in some other version
        if (!tempStorage.hasOwnProperty(key) && tempStorage.hasOwnProperty(key.toLowerCase())) {
            key = key.toLowerCase();
        }
        if (tempStorage.hasOwnProperty(key)) {
            delete tempStorage[key];
            delete tempStorageDeadlines[key];
        }
        StorageManagerStatic.tempStorage = tempStorage;
        StorageManagerStatic.tempStorageDeadlines = tempStorageDeadlines;
    }
    setFlag(name: string, value: boolean) {
        let flags = this.getVariable<string[]>(this.keysSystem.FLAGS_CATEGORY_KEY) || [];
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
        this.setVariable(this.keysSystem.FLAGS_CATEGORY_KEY, flags);
    }
    getFlag(name: string): boolean {
        let flags = this.getVariable<string[]>(this.keysSystem.FLAGS_CATEGORY_KEY) || [];
        return flags.includes(name);
    }
    public clear() {
        this.storage.clear();
        StorageManagerStatic.startingStorage.forEach(({ key, value }) => {
            this.storage.set(key, value);
        });
    }
    public exportJson(): string {
        return JSON.stringify(this.export());
    }
    public export(): ExportedStorage {
        let items: CacheableStoreItem[] = [];
        this.storage.keys().forEach((key) => {
            items.push({ key, value: this.storage.get(key) });
        });
        return createExportableElement(items);
    }
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString));
    }
    public import(data: ExportedStorage) {
        this.clear();
        try {
            if (data) {
                // id data is array
                if (Array.isArray(data)) {
                    data.forEach((item) => {
                        this.storage.set(item.key, item.value);
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
