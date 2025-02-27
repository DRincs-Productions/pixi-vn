import { StorageElementType } from "../../types/StorageElementType";

export interface CacheableStoreItem {
    key: string;
    value: StorageElementType;
}

/**
 * Interface exported storage data
 */
type ExportedStorage =
    | CacheableStoreItem[]
    // deprecated
    | {
          [key: string]: StorageElementType;
      };
export default ExportedStorage;
