import { ContainerST } from "../pixiElement/ContainerST";
import { TextST } from "../pixiElement/TextST";

/**
 * List of string errors that can be shown in the canvas.
 */
export const STRING_ERRORS = {
    IMAGE_NOT_FOUND: "texture not found",
    FILE_NOT_IS_IMAGE: "file not is a image",
}

/**
 * Show a error text in the container (Canvas).
 * This is very useful to show errors when a file is not found.
 * @param string  The string to be shown
 * @param container  The container where the string will be shown
 */
export function showErrorText(string: string, container: ContainerST) {
    const text = new TextST(string)
    container.addChild(text);
}
