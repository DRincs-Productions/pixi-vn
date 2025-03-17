import { filters as f } from "@pixi/sound";
import { PauseType, RepeatType } from "./canvas";

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

export const filters = {
    DistortionFilter: f.DistortionFilter,
    EqualizerFilter: f.EqualizerFilter,
    MonoFilter: f.MonoFilter,
    ReverbFilter: f.ReverbFilter,
    StereoFilter: f.StereoFilter,
    StreamFilter: f.StreamFilter,
    TelephoneFilter: f.TelephoneFilter,
};

export const videoFormats = [
    "webm",
    "mp4",
    "ogv",
    "mov",
    "avi",
    "wmv",
    "flv",
    "mkv",
    "3gp",
    "mpg",
    "mpeg",
    "m4v",
    "f4v",
    "m2v",
    "asf",
    "vob",
    "ts",
    "m2ts",
    "mts",
    "divx",
    "xvid",
    "rm",
    "rmvb",
    "dat",
    "swf",
    "mpv",
    "mxf",
    "vcd",
    "svcd",
    "dvd",
    "dv",
    "3g2",
    "m2p",
    "m2ts",
    "m2v",
    "m4v",
    "mpe",
    "mpg",
    "mpv2",
    "ogm",
    "qt",
    "rm",
    "ts",
    "vob",
    "wmv",
    "xvid",
    "flv",
    "mkv",
    "mov",
    "mp4",
    "webm",
    "avi",
    "ogv",
    "m4v",
    "f4v",
    "m2v",
    "asf",
    "vob",
    "ts",
    "m2ts",
    "mts",
    "divx",
    "xvid",
    "rm",
    "rmvb",
    "dat",
    "swf",
    "mpv",
    "mxf",
    "vcd",
    "svcd",
    "dvd",
    "dv",
    "3g2",
    "m2p",
    "m2ts",
    "m2v",
    "m4v",
    "mpe",
    "mpg",
    "mpv2",
    "ogm",
    "qt",
    "rm",
    "ts",
    "vob",
    "wmv",
    "xvid",
    "flv",
    "mkv",
    "mov",
    "mp4",
    "webm",
    "avi",
    "ogv",
    "m4v",
    "f4v",
    "m2v",
    "asf",
    "vob",
];

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

export const SYSTEM_RESERVED_STORAGE_KEYS = {
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
