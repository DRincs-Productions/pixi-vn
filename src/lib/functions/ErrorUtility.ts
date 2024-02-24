import { Container, Text } from "pixi.js";

export const STRING_ERRORS = {
    IMAGE_NOT_FOUND: "texture not found",
    FILE_NOT_IS_IMAGE: "file not is a image",
}

export function showErrorText(string: string, container: Container) {
    const text = new Text(string)
    container.addChild(text);
}
