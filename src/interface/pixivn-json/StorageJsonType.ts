import { StorageElementType } from "../../types"

export type GetStorageJsonType = {
    type: "get",
    key: string,
    storageType: "storage" | "flagStorage",
}

export type SetStorageJsonType = {
    type: "set",
    key: string,
    value: StorageElementType | GetStorageJsonType,
    storageType: "storage",
}

export type SetFlagStorageJsonType = {
    type: "set",
    key: string,
    value: boolean,
    storageType: "flagStorage",
}
