import { CanvasText } from "../classes/canvas/CanvasText";

/**
 * List of string errors that can be shown in the canvas.
 */
export const STRING_ERRORS = {
    IMAGE_NOT_FOUND: "texture not found",
    FILE_NOT_IS_IMAGE: "file not is a image",
}

/**
 * Create a Canvas Text with the string error.
 * @param errorText is the string error.
 * @returns a Canvas Text with the string error.
 */
export function createTextError(errorText: string) {
    return new CanvasText(errorText)
}
