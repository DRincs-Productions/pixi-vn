import type { StorageElementType } from "../types/StorageElementType";

export interface StorageGameStateItem<T = StorageElementType> {
    key: string;
    value: T;
}

/**
 * Interface exported storage data
 */
export default interface StorageGameState {
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
    main: StorageGameStateItem[];
}
