import { StorageElementType } from "../types/StorageElementType";

export interface CacheableStoreItem<T = StorageElementType> {
    key: string;
    value: T;
}

/**
 * Interface exported storage data
 */
type StorageGameState =
    | {
          base: CacheableStoreItem[];
          temp: CacheableStoreItem[];
          tempDeadlines: CacheableStoreItem<number>[];
      }
    | CacheableStoreItem[]
    // deprecated
    | {
          [key: string]: StorageElementType;
      };
export default StorageGameState;
