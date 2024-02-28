import { StorageElementType } from "../../types/StorageElementType"

/**
 * Interface exported storage data
 */
export interface ExportedStorage {
    storage: { [key: string]: StorageElementType }
    stepOidUsedList: string[]
}
