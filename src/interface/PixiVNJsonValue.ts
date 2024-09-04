import { getFlag } from "../functions"
import { StorageElementType } from "../types"
import PixiVNJsonArithmeticOperations from "./PixiVNJsonArithmeticOperations"
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
export type PixiVNJsonArithmeticGet = {
    type: "value"
    storageOperationType: "get",
    operation: PixiVNJsonArithmeticOperations,
    storageType: "arithmetic",
}
export type PixiVNJsonValueGet = PixiVNJsonStorageGet | PixiVNJsonLabelGet | PixiVNJsonArithmeticGet

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
    value: StorageElementType | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditionalStatements<StorageElementType>,
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
