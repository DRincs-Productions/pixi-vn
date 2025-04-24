import { LRUCache } from "lru-cache";
import StorageManagerStatic from "../../storage/StorageManagerStatic";
import { StorageElementType } from "../types/StorageElementType";
import StorageGameState from "./StorageGameState";

export default interface StorageManagerInterface {
    /**
     * The internal storage. **Do not modify this directly.**
     *
     * ATTENTION: If you edit this directly, the {@link this.cache} will not be updated.
     *
     * You can use Keyv with Pixi’VN by creating a new instance of Keyv and passing the storage object as a parameter.
     * ```ts
     * import { storage } from '@drincs/pixi-vn'
     * import Keyv from 'keyv';
     *
     * const keyvStorage = new Keyv({ store: storage.storage });
     *
     * keyvStorage.get<string>("myValue").then((value) => {
     *     console.log(value);
     * });
     * ```
     */
    readonly storage: Map<string, StorageElementType>;
    /**
     * The internal cache. **Do not modify this directly.**
     */
    readonly cache: LRUCache<string, any, unknown>;
    /**
     * System-reserved storage keys
     */
    readonly keysSystem: typeof StorageManagerStatic.keysSystem;
    /**
     * Set the starting storage. The starting storage that will be used when the game starts.
     * By default, the starting storage is empty.
     */
    set startingStorage(value: { [key: string]: StorageElementType });
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
     * To get the temporary variable, use {@link getVariable}
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
     * @param key The name of the flag
     * @param value The value of the flag.
     */
    setFlag(key: string, value: boolean): void;
    /**
     * Get the value of a flag
     * @param key The name of the flag
     * @returns The value of the flag
     */
    getFlag(key: string): boolean;

    /**
     * Clear the storage and the oidsUsed
     * @returns
     */
    clear(): void;
    /**
     * Export the storage to an object
     * @returns The object
     */
    export(): StorageGameState;
    /**
     * Restore the storage from an object
     * @param data The object
     */
    restore(data: StorageGameState): void;
}
