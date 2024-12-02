import { filters as f } from '@pixi/sound';
import { canvas } from './managers';
import { PauseType, RepeatType } from "./types";

export { version as PIXIVN_VERSION } from '../package.json';
export const Repeat: RepeatType = "repeat"
/**
 * Pause the tickers for a duration.
 * @param duration Duration in seconds
 * @returns The pause object
 */
export function Pause(duration: number): PauseType {
    return {
        type: "pause",
        duration: duration,
    }
}

export const filters = {
    DistortionFilter: f.DistortionFilter,
    EqualizerFilter: f.EqualizerFilter,
    MonoFilter: f.MonoFilter,
    ReverbFilter: f.ReverbFilter,
    StereoFilter: f.StereoFilter,
    StreamFilter: f.StreamFilter,
    TelephoneFilter: f.TelephoneFilter,
}

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
]

/**
 * Is a special alias to indicate {@link canvas.app.stage}.
 */
export const CANVAS_APP_STAGE_ALIAS = "_stage_"

export const CANVAS_CONTAINER_ID = "Container"
export const CANVAS_IMAGE_CONTAINER_ID = "ImageContainer"
export const CANVAS_IMAGE_ID = "Image"
export const CANVAS_SPRITE_ID = "Sprite"
export const CANVAS_TEXT_ID = "Text"
export const CANVAS_VIDEO_ID = "Video"
