import { createExportableElement } from "../functions/export-utility";
import { StorageElementType } from "../types/StorageElementType";

export default class StorageManagerStatic {
    static storage: { [key: string]: StorageElementType } = {};
    static baseStorage: { [key: string]: StorageElementType } = {};
    private constructor() {}
    public static get _keysSystem() {
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
             * The key of the input memory. This value can be read by pixi-vn json importer
             */
            CURRENT_INPUT_VALUE_MEMORY_KEY: "_input_value_",
            /**
             * The key of the last input added in the step memory
             */
            LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY: "___last_input_added_in_step_memory___",
            /**
             * The key of the current input info
             */
            CURRENT_INPUT_INFO_MEMORY_KEY: "___current_input_info_memory___",
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
            /**
             * The key of the current step memory
             */
            TEMP_STORAGE_KEY: "___temp_storage___",
            /**
             * The key of the current step memory deadlines
             */
            TEMP_STORAGE_DEADLINES_KEY: "___temp_storage_deadlines___",
        };
    }
    static get tempStorage(): { [key: string]: StorageElementType } {
        return StorageManagerStatic.storage[StorageManagerStatic._keysSystem.TEMP_STORAGE_KEY] || ({} as any);
    }
    static set tempStorage(value: { [key: string]: StorageElementType }) {
        StorageManagerStatic.storage[StorageManagerStatic._keysSystem.TEMP_STORAGE_KEY] = value;
    }
    static get tempStorageDeadlines(): { [key: string]: number } {
        return StorageManagerStatic.storage[StorageManagerStatic._keysSystem.TEMP_STORAGE_DEADLINES_KEY] || ({} as any);
    }
    static set tempStorageDeadlines(value: { [key: string]: number }) {
        StorageManagerStatic.storage[StorageManagerStatic._keysSystem.TEMP_STORAGE_DEADLINES_KEY] = value;
    }
    static getTempVariable<T extends StorageElementType>(key: string): T | undefined {
        key = key.toLowerCase();
        if (StorageManagerStatic.tempStorage.hasOwnProperty(key)) {
            return createExportableElement(StorageManagerStatic.tempStorage[key]) as T;
        }
        return undefined;
    }
    static clearOldTempVariables(openedLabelsNumber: number) {
        let tempStorage = StorageManagerStatic.tempStorage;
        let tempStorageDeadlines = StorageManagerStatic.tempStorageDeadlines;
        if (openedLabelsNumber === 0) {
            tempStorage = {};
            tempStorageDeadlines = {};
        } else {
            for (const key in tempStorageDeadlines) {
                if (tempStorageDeadlines[key] < openedLabelsNumber) {
                    delete tempStorage[key];
                    delete tempStorageDeadlines[key];
                }
            }
        }
        StorageManagerStatic.tempStorage = tempStorage;
        StorageManagerStatic.tempStorageDeadlines = tempStorageDeadlines;
    }
}
