import { Assets, Texture } from 'pixi.js';
import { CanvasImage, CanvasImageAsync } from '../classes/canvas/CanvasImage';
import { GameWindowManager } from '../managers/WindowManager';
import { CanvasContainer } from '../pixiElement/ContainerST';
import { CanvasSprite } from '../pixiElement/SpriteST';
import { CanvasText } from '../pixiElement/TextST';
import { STRING_ERRORS, createTextError } from './ErrorUtility';

/**
 * Show a image in the canvas.
 * If exist a image with the same tag, then the image is replaced.
 * If the image not exist, then a error is shown in canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 */
export function showImage(tag: string, imageUrl: string): CanvasContainer | void {
    try {
        let container = new CanvasImage(imageUrl)
        GameWindowManager.addChild(tag, container)
    }
    catch (e) {
        console.error(e)
        return
    }
}

/**
 * Show a image in the canvas, but asynchronously.
 * If exist a image with the same tag, then the image is replaced.
 * If the image not exist, then a error is shown in canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 */
export async function showImageAsync(tag: string, imageUrl: string): Promise<void | CanvasContainer> {
    try {
        let container = new CanvasImageAsync(imageUrl)
        GameWindowManager.addChild(tag, container)
    }
    catch (e) {
        console.error(e)
        return
    }
}

/**
 * Get a image sprite from a url.
 * @param imageUrl is the url of the image.
 * @returns the image sprite, or a text with the error.
 */
export function getImageSprite(imageUrl: string): CanvasSprite | CanvasText {
    let texture: Texture | undefined = undefined
    try {
        texture = Texture.from(imageUrl)
    }
    catch (e) {
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return createTextError(STRING_ERRORS.IMAGE_NOT_FOUND)
    }

    if (!texture) {
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return createTextError(STRING_ERRORS.IMAGE_NOT_FOUND)
    }
    // if texture not is a Texture, then it is a TextureResource
    if (!(texture instanceof Texture)) {
        console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
        return createTextError(STRING_ERRORS.FILE_NOT_IS_IMAGE)
    }

    return new CanvasSprite(texture)
}

/**
 * Get a image sprite from a url, but asynchronously.
 * @param imageUrl is the url of the image.
 * @returns the image sprite, or a text with the error.
 */
export async function getImageSpriteAsync(imageUrl: string): Promise<CanvasSprite | CanvasText> {
    return Assets.load(imageUrl)
        .then((texture) => {
            if (!texture) {
                console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
                return createTextError(STRING_ERRORS.IMAGE_NOT_FOUND)
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
                return createTextError(STRING_ERRORS.FILE_NOT_IS_IMAGE)
            }

            return new CanvasSprite(texture)
        })
        .catch(() => {
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return createTextError(STRING_ERRORS.IMAGE_NOT_FOUND)
        })
}

/**
 * Hide a image from the canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 */
export function hideImage(tag: string) {
    GameWindowManager.removeChild(tag)
}
