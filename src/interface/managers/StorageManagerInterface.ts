import { CacheableMemory } from "cacheable";
import { StorageManagerStatic } from "../../managers";
import { StorageElementType } from "../../types";
import ExportedStorage from "../export/ExportedStorage";

export default interface StorageManagerInterface {
    /**
     * Get the CacheableMemory storage.
     * CacheableMemory is a cache system that can be used to store data in memory.
     * You can read more about it here: https://cacheable.org/docs/cacheable/#cacheablememory---in-memory-cache
     */
    readonly storage: CacheableMemory;
    /**
     * System-reserved storage keys
     */
    readonly keysSystem: typeof StorageManagerStatic._keysSystem;
    /**
     * Set a variable in the storage
     * @param key The key of the variable
     * @param value The value of the variable. If undefined, the variable will be removed
     * @returns
     */
    setVariable(key: string, value: StorageElementType): void;
    /**
     * Get a variable from the storage. If the variable is a temporary variable, it will return the temporary variable
     * @param key The key of the variable
     * @returns The value of the variable. If the variable does not exist, it will return undefined
     */
    getVariable<T extends StorageElementType>(key: string): T | undefined;
    /**
     * Remove a variable from the storage
     * @param key The key of the variable
     * @returns
     */
    removeVariable(key: string): void;
    /**
     * Set a variable in the temporary storage. The lifespan of the variable is the number of opened labels.
     * To get the temporary variable, use {@link this.getVariable}
     * @param key The key of the temporary variable
     * @param value The value of the temporary variable. If undefined, the variable will be removed
     * @returns
     */
    setTempVariable(key: string, value: StorageElementType): void;
    /**
     * Remove a temporary variable
     * @param key The key of the temporary variable
     */
    removeTempVariable(key: string): void;

    /**
     * Set a flag to true or false.
     * @param name The name of the flag
     * @param value The value of the flag.
     */
    setFlag(name: string, value: boolean): void;
    /**
     * Get the value of a flag
     * @param name The name of the flag
     * @returns The value of the flag
     */
    getFlag(name: string): boolean;

    /**
     * Clear the storage and the oidsUsed
     * @returns
     */
    clear(): void;
    /**
     * Export the storage to a JSON string
     * @returns The JSON string
     */
    exportJson(): string;
    /**
     * Export the storage to an object
     * @returns The object
     */
    export(): ExportedStorage;
    /**
     * Import the storage from a JSON string
     * @param dataString The JSON string
     */
    importJson(dataString: string): void;
    /**
     * Import the storage from an object
     * @param data The object
     */
    import(data: ExportedStorage): void;
}
