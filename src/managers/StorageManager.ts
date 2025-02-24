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
        if (value === undefined || value === null) {
            this.storage.delete(key);
            return;
        }
        this.storage.set(key, value);
    }
    public getVariable<T extends StorageElementType>(key: string): T | undefined {
        if (StorageManagerStatic.tempStorage.hasOwnProperty(key)) {
            return StorageManagerStatic.getTempVariable<T>(key);
        }
        return createExportableElement(this.storage.get<T>(key));
    }
    public removeVariable(key: string) {
        if (this.storage.has(key)) {
            this.storage.delete(key);
        }
    }
    public setTempVariable(key: string, value: StorageElementType) {
        let tempStorage = StorageManagerStatic.tempStorage;
        let tempStorageDeadlines = StorageManagerStatic.tempStorageDeadlines;
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
        this.storage.setMany(StorageManagerStatic._baseStorage);
    }
    public exportJson(): string {
        return JSON.stringify(this.export());
    }
    public export(): ExportedStorage {
        return createExportableElement([...this.storage.items]);
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
                    this.storage.setMany(data);
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
