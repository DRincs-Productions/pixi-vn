import { StorageElementType } from "../types/StorageElementType";

export interface StorageGameStateItem<T = StorageElementType> {
    key: string;
    value: T;
}

/**
 * Interface exported storage data
 */
type StorageGameState =
    | {
          base: StorageGameStateItem[];
          temp: StorageGameStateItem[];
          tempDeadlines: StorageGameStateItem<number>[];
          flags: string[];
      }
    // deprecated
    | StorageGameStateItem[]
    // deprecated
    | {
          [key: string]: StorageElementType;
      };
export default StorageGameState;
