import { getFlag } from "../functions"
import { StorageElementType } from "../types"

export type PixiVNJsonStorageGet = {
    type: "storage"
    storageOperationType: "get",
    /**
     * Key of the storage
     */
    key: string,
    /**
     * Type of the storage, if it is a flagStorage or a storage.
     * If it is a flagStorage, the value will be get with the function {@link getFlag}
     */
    storageType: "storage" | "flagStorage",
}

type PixiVNJsonOnlyStorageSet = {
    type: "storage"
    storageOperationType: "set",
    /**
     * Key of the storage
     */
    key: string,
    /**
     * Value to be set in the storage
     */
    value: StorageElementType | PixiVNJsonStorageGet,
    /**
     * Type of the storage, if it is a flagStorage or a storage.
     */
    storageType: "storage",
}

type PixiVNJsonFlagSet = {
    type: "storage"
    storageOperationType: "set",
    /**
     * Key of the storage
     */
    key: string,
    /**
     * Value to be set in the storage
     */
    value: boolean,
    /**
     * Type of the storage, if it is a flagStorage or a storage.
     */
    storageType: "flagStorage",
}

export type PixiVNJsonStorageSet = (PixiVNJsonOnlyStorageSet | PixiVNJsonFlagSet)
