import { StorageElementType } from "../../types"

export type PixiVNJsonStorageGet = {
    type: "get",
    key: string,
    storageType: "storage" | "flagStorage",
}

export type PixiVNJsonStorageSet = {
    type: "set",
    key: string,
    value: StorageElementType | PixiVNJsonStorageGet,
    storageType: "storage",
}

export type PixiVNJsonFlagSet = {
    type: "set",
    key: string,
    value: boolean,
    storageType: "flagStorage",
}
