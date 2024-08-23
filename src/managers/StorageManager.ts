import { createExportableElement } from "../functions/ExportUtility"
import { ExportedStorage } from "../interface"
import { StorageElementType } from "../types/StorageElementType"

export default class GameStorageManager {
    private static storage: { [key: string]: StorageElementType } = {}
    private constructor() { }
    public static get keysSystem() {
        return {
            /**
             * The key of the current dialogue memory
             */
            CURRENT_DIALOGUE_MEMORY_KEY: "___current_dialogue_memory___",
            /**
             * The key of the last dialogue added in the step memory
             */
            LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY: "___last_dialogue_added_in_step_memory___",
            /**
             * The key of the current menu options memory
             */
            CURRENT_MENU_OPTIONS_MEMORY_KEY: "___current_menu_options_memory___",
            /**
             * The key of the last menu options added in the step memory
             */
            LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY: "___last_menu_options_added_in_step_memory___",
            /**
             * The key of the characters memory
             */
            CHARACTER_CATEGORY_KEY: "___character___",
            /**
             * The key of the flags memory
             */
            FLAGS_CATEGORY_KEY: "___flags___",
            /**
             * This variable is used to add the next dialog text into the current dialog memory.
             * This value was added to introduce Ink Glue functionality https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#glue
             */
            ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY: "___glue___",
            /**
             * The key of a list of all labels that have been opened during the progression of the steps.
             */
            OPENED_LABELS_COUNTER_KEY: "___opened_labels_counter___",
            /**
             * The key of a list of all choices that have been made during the progression of the steps.
             */
            ALL_CHOICES_MADE_KEY: "___all_choices_made___",
            /**
             * The key of the current step times counter.
             * This value was added to introduce Ink Sequences, cycles and other alternatives https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#sequences-cycles-and-other-alternatives
             */
            CURRENT_STEP_TIMES_COUNTER_KEY: "___current_step_times_counter___",
        }
    }
    /**
     * Set a variable in the storage
     * @param key The key of the variable
     * @param value The value of the variable. If undefined, the variable will be removed
     * @returns
     */
    public static setVariable(key: string, value: StorageElementType) {
        key = key.toLowerCase()
        if (value === undefined || value === null) {
            if (GameStorageManager.storage.hasOwnProperty(key)) {
                delete GameStorageManager.storage[key]
            }
            return
        }
        GameStorageManager.storage[key] = value
    }
    /**
     * Get a variable from the storage
     * @param key The key of the variable
     * @returns The value of the variable. If the variable does not exist, it will return undefined
     */
    public static getVariable<T extends StorageElementType>(key: string): T | undefined {
        key = key.toLowerCase()
        if (GameStorageManager.storage.hasOwnProperty(key)) {
            return GameStorageManager.storage[key] as T
        }
        return undefined
    }
    /**
     * Remove a variable from the storage
     * @param key The key of the variable
     * @returns
     */
    public static removeVariable(key: string) {
        key = key.toLowerCase()
        if (GameStorageManager.storage.hasOwnProperty(key)) {
            delete GameStorageManager.storage[key]
        }
    }
    /**
     * Clear the storage and the oidsUsed
     * @returns
     */
    public static clear() {
        GameStorageManager.storage = {}
    }
    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedStorage {
        return createExportableElement(GameStorageManager.storage)
    }
    public static importJson(dataString: string) {
        GameStorageManager.import(JSON.parse(dataString))
    }
    public static import(data: object) {
        GameStorageManager.clear()
        try {
            if (data) {
                GameStorageManager.storage = (data as ExportedStorage)
            }
            else {
                console.warn("[Pixi'VN] No storage data found")
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
