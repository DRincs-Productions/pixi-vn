import { StorageElementType } from "../../types/StorageElementType";

interface CacheableStoreItem {
    key: string;
    value: StorageElementType;
    expires?: number;
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
