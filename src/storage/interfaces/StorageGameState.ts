import { StorageElementType } from "../types/StorageElementType";

export interface StorageGameStateItem<T = StorageElementType> {
    key: string;
    value: T;
}

/**
 * Interface exported storage data
 */
type StorageGameState = {
    /**
     * @deprecated
     */
    base?: StorageGameStateItem[];
    /**
     * @deprecated
     */
    temp?: StorageGameStateItem[];
    tempDeadlines: StorageGameStateItem<number>[];
    /**
     * @deprecated
     */
    flags?: string[];
    storage: StorageGameStateItem[];
};
export default StorageGameState;
