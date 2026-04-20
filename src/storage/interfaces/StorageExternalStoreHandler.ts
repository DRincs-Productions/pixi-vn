import type { StorageElementType } from "../types/StorageElementType";

export default interface StorageExternalStoreHandler {
    /**
     * Triggered when {@link StorageManagerStatic.setVariable} is called.
     * The key is provided without any storage prefix.
     */
    onSetVariable?: (key: string, value: StorageElementType) => void;
    /**
     * Triggered when a temp variable is removed by {@link StorageManagerStatic.clearOldTempVariables}.
     * The key is provided without any storage prefix.
     */
    onClearOldTempVariable?: (key: string) => void;
    /**
     * Triggered when {@link StorageManagerStatic.removeVariable} is called.
     * The key is provided without any storage prefix.
     */
    onRemoveVariable?: (key: string) => void;
}
