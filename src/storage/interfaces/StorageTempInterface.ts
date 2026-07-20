import type { StorageElementType } from "@storage/types/StorageElementType";

export default interface StorageTempInterface {
    /**
     * Set a variable in the temporary storage. The lifespan of the variable is the number of opened labels.
     * To get the temporary variable, use {@link StorageManagerInterface.get}
     * @param key The key of the temporary variable
     * @param value The value of the temporary variable. If undefined, the variable will be removed
     */
    set(key: string, value: StorageElementType): void;
    /**
     * Remove a temporary variable
     * @param key The key of the temporary variable
     */
    remove(key: string): void;
    /**
     * The deadlines of the temporary variables, expressed as the number of opened labels after which
     * each variable will be removed. **Do not modify this directly.**
     */
    readonly deadlines: Map<string, number>;
}
