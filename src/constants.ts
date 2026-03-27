import type { PauseType, RepeatType } from "./canvas";

export { version as PIXIVN_VERSION } from "../package.json";
export const Repeat: RepeatType = "repeat";
/**
 * Pause the tickers for a duration.
 * @param duration Duration in seconds
 * @returns The pause object
 */
export function Pause(duration: number): PauseType {
    return {
        type: "pause",
        duration: duration,
    };
}

/**
 * Is a special alias to indicate the game layer.
 */
export const CANVAS_APP_GAME_LAYER_ALIAS = "__game_layer__";

export const CANVAS_CONTAINER_ID = "Container";
export const CANVAS_IMAGE_CONTAINER_ID = "ImageContainer";
export const CANVAS_IMAGE_ID = "Image";
export const CANVAS_SPRITE_ID = "Sprite";
export const CANVAS_TEXT_ID = "Text";
export const CANVAS_VIDEO_ID = "Video";

export const MAIN_STORAGE_KEY = "storage";
export const TEMP_STORAGE_KEY = "temp";
export const NARRATION_STORAGE_KEY = "narration";
export const FLAGS_KEY = "flags";

export const SYSTEM_RESERVED_STORAGE_KEYS = {
    /**
     * The key of the current dialogue memory
     */
    CURRENT_DIALOGUE_MEMORY_KEY: "dialogue",
    /**
     * The key of step counter of the current dialogue memory
     */
    LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY: "dialogue:step_counter",
    /**
     * The key of the current menu options memory
     */
    CURRENT_MENU_OPTIONS_MEMORY_KEY: "choice:options",
    /**
     * The key of the last menu options added in the step memory
     */
    LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY: "choice:step_counter",
    /**
     * The key of the input memory. This value can be read by pixi-vn json importer
     */
    CURRENT_INPUT_VALUE_MEMORY_KEY: "input:value",
    /**
     * The key of the last input added in the step memory
     */
    LAST_INPUT_ADDED_IN_STEP_MEMORY_KEY: "input:step_counter",
    /**
     * The key of the current input info
     */
    CURRENT_INPUT_INFO_MEMORY_KEY: "input:info",
    /**
     * The key of the characters memory
     */
    CHARACTER_CATEGORY_KEY: "character",
    /**
     * This variable is used to add the next dialog text into the current dialog memory.
     * This value was added to introduce Ink Glue functionality https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#glue
     */
    ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY: "___glue___",
    /**
     * The key of a list of all labels that have been opened during the progression of the steps.
     */
    OPENED_LABELS_COUNTER_KEY: "label:opened",
    /**
     * The key of a list of all choices that have been made during the progression of the steps.
     */
    ALL_CHOICES_MADE_KEY: "choices:made",
    /**
     * The key of the current step times counter.
     * This value was added to introduce Ink Sequences, cycles and other alternatives https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#sequences-cycles-and-other-alternatives
     */
    CURRENT_STEP_TIMES_COUNTER_KEY: "label:history",
    /**
     * The key of the last dialogue step glued in the step memory
     */
    LAST_STEP_GLUED: "glue:last_step",
};
