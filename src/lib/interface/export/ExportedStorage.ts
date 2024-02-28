import { StorageElementType } from "../../types/StorageElementType"

export interface ExportedStorage {
    storage: { [key: string]: StorageElementType }
    stepOidUsedList: string[]
}
