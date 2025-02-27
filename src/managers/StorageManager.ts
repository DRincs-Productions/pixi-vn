import { narration } from ".";
import { createExportableElement } from "../functions/export-utility";
import { logger } from "../functions/log-utility";
import { ExportedStorage, StorageManagerInterface } from "../interface";
import { StorageElementType } from "../types/StorageElementType";
import StorageManagerStatic from "./StorageManagerStatic";

export default class StorageManager implements StorageManagerInterface {
    get storage() {
        return StorageManagerStatic._storage;
    }
    get keysSystem() {
        return StorageManagerStatic._keysSystem;
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
        // TODO: return createExportableElement(this.storage.get<T>(key));
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
                tempStorageDeadlines[key] = narration.openedLabels.length;
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
        // TODO: this.storage.setMany(StorageManagerStatic._baseStorage);
        Object.entries(StorageManagerStatic._baseStorage).forEach(([key, value]) => {
            this.storage.set(key, value);
        });
    }
    public exportJson(): string {
        return JSON.stringify(this.export());
    }
    public export(): ExportedStorage {
        // TODO: return createExportableElement([...this.storage.items]);
        let data: ExportedStorage = [];
        this.storage.keys().forEach((key) => {
            let item = this.storage.get(key);
            data.push({ key: key, value: item });
        });
        return createExportableElement(data);
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
                    // TODO: this.storage.setMany(data);
                    data.forEach(({ key, value }) => {
                        this.storage.set(key, value);
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
