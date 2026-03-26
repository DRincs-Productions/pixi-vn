import { GameUnifier } from "@drincs/pixi-vn/core";
import { MAIN_STORAGE_KEY, TEMP_STORAGE_KEY } from "../constants";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
import StorageGameState, { StorageGameStateItem } from "./interfaces/StorageGameState";
import StorageManagerInterface from "./interfaces/StorageManagerInterface";
import StorageManagerStatic from "./StorageManagerStatic";
import { StorageElementType } from "./types/StorageElementType";

export default class StorageManager implements StorageManagerInterface {
    get base() {
        return StorageManagerStatic.storage.map;
    }
    get cache() {
        return StorageManagerStatic.storage.cache as any;
    }
    get tempStorageDeadlines() {
        return StorageManagerStatic.tempStorageDeadlines;
    }
    set default(value: { [key: string]: StorageElementType }) {
        Object.entries(value).forEach(([key, value]) => {
            StorageManagerStatic.default.set(key, value);
        });
    }
    public set(key: string, value: StorageElementType) {
        const isInTempStorage = StorageManagerStatic.getVariable(TEMP_STORAGE_KEY, key);
        if (isInTempStorage) {
            StorageManagerStatic.setVariable(TEMP_STORAGE_KEY, key, value);
            return;
        }
        return StorageManagerStatic.setVariable(MAIN_STORAGE_KEY, key, value);
    }
    public get<T extends StorageElementType>(key: string): T | undefined {
        let result = StorageManagerStatic.getVariable<T>(MAIN_STORAGE_KEY, key);
        if (result === undefined) {
            result = StorageManagerStatic.getVariable<T>(TEMP_STORAGE_KEY, key);
        }
        if (result === undefined) {
            result = createExportableElement(StorageManagerStatic.default.get(key));
        }
        return result;
    }
    public remove(key: string) {
        this.removeTempVariable(key);
        return StorageManagerStatic.removeVariable(MAIN_STORAGE_KEY, key);
    }
    public setTempVariable(key: string, value: StorageElementType) {
        if (value === undefined || value === null) {
            this.removeTempVariable(key);
            return;
        } else {
            StorageManagerStatic.setVariable(TEMP_STORAGE_KEY, key, value);
            if (!this.tempStorageDeadlines.has(key)) {
                this.tempStorageDeadlines.set(key, GameUnifier.openedLabels);
            }
        }
    }
    public removeTempVariable(key: string) {
        StorageManagerStatic.removeVariable(TEMP_STORAGE_KEY, key);
        if (this.tempStorageDeadlines.has(key)) {
            this.tempStorageDeadlines.delete(key);
        }
    }
    setFlag(key: string, value: boolean) {
        return StorageManagerStatic.setFlag(key, value);
    }
    getFlag(key: string): boolean {
        return StorageManagerStatic.getFlag(key);
    }
    public clear() {
        this.base.clear();
        this.cache.clear();
        this.tempStorageDeadlines.clear();
    }
    public export(): StorageGameState {
        let storage: StorageGameStateItem[] = [];
        [...this.base.keys()].forEach((key) => {
            storage.push({ key, value: this.base.get(key) });
        });
        let tempDeadlines: StorageGameStateItem<number>[] = [];
        [...StorageManagerStatic.tempStorageDeadlines.keys()].forEach((key) => {
            tempDeadlines.push({ key, value: this.tempStorageDeadlines.get(key)! });
        });
        return createExportableElement({
            storage,
            tempDeadlines,
        });
    }
    public restore(data: StorageGameState) {
        this.clear();
        try {
            if (data) {
                (data.base as any)?.forEach((item: StorageGameStateItem) => {
                    StorageManagerStatic.setVariable(MAIN_STORAGE_KEY, item.key, item.value);
                });
                (data.temp as any)?.forEach((item: StorageGameStateItem) => {
                    StorageManagerStatic.setVariable(TEMP_STORAGE_KEY, item.key, item.value);
                });
                (data.flags as any)?.forEach((flag: string) => {
                    StorageManagerStatic.setFlag(flag, true);
                });
                (data.storage as any)?.forEach((item: StorageGameStateItem) => {
                    this.base.set(item.key, item.value);
                });
                (data.tempDeadlines as any)?.forEach((item: StorageGameStateItem<number>) => {
                    this.tempStorageDeadlines.set(item.key, item.value);
                });
            } else {
                logger.warn("No storage data found");
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
