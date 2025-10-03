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
