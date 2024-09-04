import { getFlag } from "../functions"
import { StorageElementType } from "../types"
import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"

export type PixiVNJsonStorageGet = {
    type: "value"
    storageOperationType: "get",
    /**
     * Key of the storage
     */
    key: string,
    /**
     * Type of the storage, if it is a flagStorage or a storage.
     * If it is a flagStorage, the value will be get with the function {@link getFlag}
     */
    storageType: "storage" | "flagStorage" | "tempstorage",
}

export type PixiVNJsonLabelGet = {
    type: "value"
    storageOperationType: "get",
    /**
     * Id of the label
     */
    label: string,
    /**
     * If it is a label, the value will be get with the function {@link narration.getTimesLabelOpened}
     */
    storageType: "label",
}
export type PixiVNJsonValueGet = PixiVNJsonStorageGet | PixiVNJsonLabelGet

type PixiVNJsonOnlyStorageSet = {
    type: "value"
    storageOperationType: "set",
    /**
     * Key of the storage
     */
    key: string,
    /**
     * Value to be set in the storage
     */
    value: StorageElementType | PixiVNJsonValueGet | PixiVNJsonConditionalStatements<StorageElementType>,
    /**
     * Type of the storage, if it is a flagStorage or a storage.
     */
    storageType: "storage" | "tempstorage",
}

type PixiVNJsonFlagSet = {
    type: "value"
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

export type PixiVNJsonValueSet = (PixiVNJsonOnlyStorageSet | PixiVNJsonFlagSet)
