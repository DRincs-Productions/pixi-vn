import {
    MAIN_STORAGE_KEY,
    NARRATION_STORAGE_KEY,
    SYSTEM_RESERVED_STORAGE_KEYS,
    TEMP_STORAGE_KEY,
} from "@constants";
import { GameUnifier } from "@drincs/pixi-vn/core";
import type StorageExternalStoreHandler from "@storage/interfaces/StorageExternalStoreHandler";
import type StorageFlagsInterface from "@storage/interfaces/StorageFlagsInterface";
import type StorageGameState from "@storage/interfaces/StorageGameState";
import type { StorageGameStateItem } from "@storage/interfaces/StorageGameState";
import type StorageManagerInterface from "@storage/interfaces/StorageManagerInterface";
import type StorageTempInterface from "@storage/interfaces/StorageTempInterface";
import StorageRegistry from "@storage/StorageRegistry";
import type { StorageElementType } from "@storage/types/StorageElementType";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";

export default class StorageManager implements StorageManagerInterface {
    get base() {
        return StorageRegistry.storage.map;
    }
    get cache() {
        return StorageRegistry.storage.cache as any;
    }
    /**
     * @deprecated Use {@link temp}.deadlines instead.
     */
    get tempStorageDeadlines() {
        return StorageRegistry.tempStorageDeadlines;
    }
    set default(value: { [key: string]: StorageElementType }) {
        Object.entries(value).forEach(([key, value]) => {
            StorageRegistry.defaultStorage.map.set(key, value);
        });
    }
    public readonly temp: StorageTempInterface = {
        set: (key, value) => this.setTemp(key, value),
        remove: (key) => this.removeTemp(key),
        get deadlines() {
            return StorageRegistry.tempStorageDeadlines;
        },
    };
    public readonly flags: StorageFlagsInterface = {
        set: (key, value) => StorageRegistry.setFlag(key, value),
        get: (key) => StorageRegistry.getFlag(key),
    };
    public set(key: string, value: StorageElementType) {
        return StorageRegistry.setVariable(MAIN_STORAGE_KEY, key, value);
    }
    public get<T>(key: string): T | undefined {
        let result = StorageRegistry.getVariable<T>(TEMP_STORAGE_KEY, key);
        if (result === undefined) {
            result = StorageRegistry.getVariable<T>(MAIN_STORAGE_KEY, key);
        }
        if (result === undefined) {
            result = createExportableElement(StorageRegistry.defaultStorage.get(key));
        }
        return result;
    }
    public remove(key: string) {
        this.temp.remove(key);
        return StorageRegistry.removeVariable(MAIN_STORAGE_KEY, key);
    }
    private setTemp(key: string, value: StorageElementType) {
        if (value === undefined || value === null) {
            this.temp.remove(key);
            return;
        } else {
            StorageRegistry.setVariable(TEMP_STORAGE_KEY, key, value);
            if (!this.temp.deadlines.has(key)) {
                this.temp.deadlines.set(key, GameUnifier.openedLabels);
            }
        }
    }
    private removeTemp(key: string) {
        StorageRegistry.removeVariable(TEMP_STORAGE_KEY, key);
        if (this.temp.deadlines.has(key)) {
            this.temp.deadlines.delete(key);
        }
    }
    /**
     * @deprecated Use {@link temp}.set instead.
     */
    public setTempVariable(key: string, value: StorageElementType) {
        this.temp.set(key, value);
    }
    /**
     * @deprecated Use {@link temp}.remove instead.
     */
    public removeTempVariable(key: string) {
        this.temp.remove(key);
    }
    /**
     * @deprecated Use {@link flags}.set instead.
     */
    setFlag(key: string, value: boolean) {
        this.flags.set(key, value);
    }
    /**
     * @deprecated Use {@link flags}.get instead.
     */
    getFlag(key: string): boolean {
        return this.flags.get(key);
    }
    setStorageHandler(value?: StorageExternalStoreHandler) {
        StorageRegistry.setExternalStoreHandler(value);
    }
    public clear() {
        this.base.clear();
        this.cache.clear();
        this.temp.deadlines.clear();
    }
    public export(): StorageGameState {
        const main: StorageGameStateItem[] = [];
        [...this.base.keys()].forEach((key) => {
            main.push({ key, value: this.base.get(key) });
        });
        const tempDeadlines: StorageGameStateItem<number>[] = [];
        [...this.temp.deadlines.keys()].forEach((key) => {
            tempDeadlines.push({ key, value: this.temp.deadlines.get(key)! });
        });
        return createExportableElement({
            main,
            tempDeadlines,
        });
    }
    public restore(data: StorageGameState) {
        this.clear();
        try {
            if (data) {
                (data.base as any)?.forEach((item: StorageGameStateItem) => {
                    switch (item.key) {
                        case "___current_dialogue_memory___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_DIALOGUE_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "___last_dialogue_added_in_step_memory___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "___current_menu_options_memory___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_MENU_OPTIONS_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "___last_menu_options_added_in_step_memory___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "_input_value_":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_VALUE_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "___last_input_added_in_step_memory___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "___current_input_info_memory___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_INPUT_INFO_MEMORY_KEY,
                                item.value,
                            );
                            break;
                        case "___opened_labels_counter___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY,
                                item.value,
                            );
                            break;
                        case "___all_choices_made___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY,
                                item.value,
                            );
                            break;
                        case "___current_step_times_counter___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY,
                                item.value,
                            );
                            break;
                        case "___last_step_glued___":
                            StorageRegistry.setVariable(
                                NARRATION_STORAGE_KEY,
                                SYSTEM_RESERVED_STORAGE_KEYS.LAST_STEP_GLUED,
                                item.value,
                            );
                            break;
                        default:
                            StorageRegistry.setVariable(MAIN_STORAGE_KEY, item.key, item.value);
                    }
                });
                (data.temp as any)?.forEach((item: StorageGameStateItem) => {
                    StorageRegistry.setVariable(TEMP_STORAGE_KEY, item.key, item.value);
                });
                (data.flags as any)?.forEach((flag: string) => {
                    StorageRegistry.setFlag(flag, true);
                });
                (data.main as any)?.forEach((item: StorageGameStateItem) => {
                    this.base.set(item.key, item.value);
                });
                (data.tempDeadlines as any)?.forEach((item: StorageGameStateItem<number>) => {
                    this.temp.deadlines.set(item.key, item.value);
                });
            } else {
                logger.warn("No storage data found");
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
