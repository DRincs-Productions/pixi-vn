import CachedMap from "@classes/CachedMap";
import { FLAGS_KEY, TEMP_STORAGE_KEY } from "@constants";
import type { StorageElementType } from "@storage/types/StorageElementType";
import { createExportableElement } from "@utils/export-utility";

export type StorageExternalStoreHandler = {
    /**
     * Triggered when {@link setVariable} is called.
     * The key is provided without any storage prefix.
     */
    onSetVariable?: (key: string, value: StorageElementType) => void;
    /**
     * Triggered when a temp variable is removed by {@link clearOldTempVariables}.
     * The key is provided without any storage prefix.
     */
    onClearOldTempVariable?: (key: string) => void;
    /**
     * Triggered when {@link removeVariable} is called.
     * The key is provided without any storage prefix.
     */
    onRemoveVariable?: (key: string) => void;
};

namespace StorageManagerStatic {
    export const storage = new CachedMap<string, any>({ cacheSize: 50 });
    export const defaultStorage = new CachedMap<string, any>({ cacheSize: 10 });
    export const tempStorageDeadlines = new Map<string, number>();
    let externalStoreHandler: StorageExternalStoreHandler | undefined;

    export function clearOldTempVariables(openedLabelsNumber: number) {
        StorageManagerStatic.tempStorageDeadlines.forEach((deadline, key) => {
            if (deadline > openedLabelsNumber) {
                StorageManagerStatic.storage.delete(`${TEMP_STORAGE_KEY}:${key}`);
                externalStoreHandler?.onClearOldTempVariable?.(key);
                StorageManagerStatic.tempStorageDeadlines.delete(key);
            }
        });
    }

    export function setExternalStoreHandler(handler?: StorageExternalStoreHandler) {
        externalStoreHandler = handler;
    }

    export function setVariable(prefix: string, key: string, value: StorageElementType) {
        if (value === undefined || value === null) {
            StorageManagerStatic.storage.delete(`${prefix}:${key}`);
        } else {
            StorageManagerStatic.storage.set(`${prefix}:${key}`, value);
        }
        externalStoreHandler?.onSetVariable?.(key, value);
    }

    export function getVariable<T = StorageElementType>(
        prefix: string,
        key: string,
    ): T | undefined {
        const result = StorageManagerStatic.storage.get(`${prefix}:${key}`);
        return createExportableElement(result) as T;
    }

    export function removeVariable(prefix: string, key: string) {
        StorageManagerStatic.storage.delete(`${prefix}:${key}`);
        externalStoreHandler?.onRemoveVariable?.(key);
    }

    export function setFlag(key: string, value: boolean) {
        const flags = StorageManagerStatic.storage.get(FLAGS_KEY) || [];
        if (value) {
            if (!flags.includes(key)) {
                flags.push(key);
            }
        } else {
            const index = flags.indexOf(key);
            if (index > -1) {
                flags.splice(index, 1);
            }
        }
        StorageManagerStatic.storage.set(FLAGS_KEY, flags);
    }

    export function getFlag(key: string): boolean {
        const flags = StorageManagerStatic.storage.get(FLAGS_KEY) || [];
        return flags.includes(key);
    }
}
export default StorageManagerStatic;
