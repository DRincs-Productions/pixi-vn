import HistoryGameState from "./HistoryGameState";

export default interface HistoryManagerInterface {
    /**
     * Clear the history.
     */
    clear(): void;

    /* Export and Import Methods */

    /**
     * Export the history to an object.
     * @returns The history in an object.
     */
    export(): HistoryGameState;
    /**
     * Restore the history from an object.
     * @param data The history in an object.
     */
    restore(data: object): Promise<void>;
}
