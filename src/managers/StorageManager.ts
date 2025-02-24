import { narration } from ".";
import { createExportableElement } from "../functions/export-utility";
import { logger } from "../functions/log-utility";
import { ExportedStorage } from "../interface";
import { StorageElementType } from "../types/StorageElementType";
import StorageManagerStatic from "./StorageManagerStatic";

export default class StorageManager {
    get keysSystem() {
        return StorageManagerStatic._keysSystem;
    }
    /**
     * Set a variable in the storage
     * @param key The key of the variable
     * @param value The value of the variable. If undefined, the variable will be removed
     * @returns
     */
    public setVariable(key: string, value: StorageElementType) {
        key = key.toLowerCase();
        if (value === undefined || value === null) {
            if (StorageManagerStatic._storage.has(key)) {
                StorageManagerStatic._storage.delete(key);
            }
            return;
        }
        StorageManagerStatic._storage.set(key, value);
    }
    /**
     * Get a variable from the storage. If the variable is a temporary variable, it will return the temporary variable
     * @param key The key of the variable
     * @returns The value of the variable. If the variable does not exist, it will return undefined
     */
    public getVariable<T extends StorageElementType>(key: string): T | undefined {
        key = key.toLowerCase();
        if (StorageManagerStatic.tempStorage.hasOwnProperty(key)) {
            return StorageManagerStatic.getTempVariable<T>(key);
        }
        if (StorageManagerStatic._storage.has(key)) {
            return createExportableElement(StorageManagerStatic._storage.get<T>(key));
        }
        return undefined;
    }
    /**
     * Remove a variable from the storage
     * @param key The key of the variable
     * @returns
     */
    public removeVariable(key: string) {
        key = key.toLowerCase();
        if (StorageManagerStatic._storage.has(key)) {
            StorageManagerStatic._storage.delete(key);
        }
    }
    /**
     * Set a variable in the temporary storage. The lifespan of the variable is the number of opened labels.
     * To get the temporary variable, use {@link this.getVariable}
     * @param key The key of the temporary variable
     * @param value The value of the temporary variable. If undefined, the variable will be removed
     * @returns
     */
    public setTempVariable(key: string, value: StorageElementType) {
        key = key.toLowerCase();
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
    /**
     * Remove a temporary variable
     * @param key The key of the temporary variable
     */
    public removeTempVariable(key: string) {
        key = key.toLowerCase();
        let tempStorage = StorageManagerStatic.tempStorage;
        let tempStorageDeadlines = StorageManagerStatic.tempStorageDeadlines;
        if (tempStorage.hasOwnProperty(key)) {
            delete tempStorage[key];
            delete tempStorageDeadlines[key];
        }
        StorageManagerStatic.tempStorage = tempStorage;
        StorageManagerStatic.tempStorageDeadlines = tempStorageDeadlines;
    }

    /**
     * Set a flag to true or false.
     * @param name The name of the flag
     * @param value The value of the flag.
     */
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

    /**
     * Get the value of a flag
     * @param name The name of the flag
     * @returns The value of the flag
     */
    getFlag(name: string): boolean {
        let flags = this.getVariable<string[]>(this.keysSystem.FLAGS_CATEGORY_KEY) || [];
        return flags.includes(name);
    }

    /**
     * Clear the storage and the oidsUsed
     * @returns
     */
    public clear() {
        StorageManagerStatic._storage.clear();
        StorageManagerStatic._storage.setMany(StorageManagerStatic._baseStorage);
    }
    public exportJson(): string {
        return JSON.stringify(this.export());
    }
    public export(): ExportedStorage {
        let cache = StorageManagerStatic._storage;
        return createExportableElement([...cache.items]);
    }
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString));
    }
    public import(data: object) {
        this.clear();
        try {
            if (data) {
                // id data is array
                if (Array.isArray(data)) {
                    data.forEach((item: { key: string; value: StorageElementType }) => {
                        StorageManagerStatic._storage.set(item.key, item.value);
                    });
                }
                // if data is object
                // deprecated
                else {
                    Object.entries(data).forEach(([key, value]) => {
                        StorageManagerStatic._storage.set(key, value);
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
