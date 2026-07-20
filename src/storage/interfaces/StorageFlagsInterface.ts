export default interface StorageFlagsInterface {
    /**
     * Set a flag to true or false.
     * @param key The name of the flag
     * @param value The value of the flag.
     */
    set(key: string, value: boolean): void;
    /**
     * Get the value of a flag
     * @param key The name of the flag
     * @returns The value of the flag
     */
    get(key: string): boolean;
}
