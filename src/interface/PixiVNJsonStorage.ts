import { StorageElementType } from "../types"

export type PixiVNJsonStorageGet = {
    type: "get",
    key: string,
    storageType: "storage" | "flagStorage",
}

type PixiVNJsonOnlyStorageSet = {
    type: "set",
    key: string,
    value: StorageElementType | PixiVNJsonStorageGet,
    storageType: "storage",
}

type PixiVNJsonFlagSet = {
    type: "set",
    key: string,
    value: boolean,
    storageType: "flagStorage",
}

export type PixiVNJsonStorageSet = (PixiVNJsonOnlyStorageSet | PixiVNJsonFlagSet)
