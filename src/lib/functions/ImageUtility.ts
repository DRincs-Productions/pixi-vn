import { Assets, Texture, UPDATE_PRIORITY } from 'pixi.js';
import { CanvasImage, CanvasImageAsync, CanvasImageBase } from '../classes/canvas/CanvasImage';
import { TickerBase } from '../classes/ticker/TickerBase';
import { TickerFadeAlpha } from '../classes/ticker/TickerFadeAlpha';
import { GameWindowManager } from '../managers/WindowManager';
import { STRING_ERRORS } from './ErrorUtility';

/**
 * Show a image in the canvas.
 * If exist a image with the same tag, then the image is replaced.
 * If the image not exist, then a error is shown in canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 */
export function showImage(tag: string, imageUrl: string): CanvasImage {
    let image = new CanvasImage(imageUrl)
    GameWindowManager.addChild(tag, image)
    return image
}

/**
 * Show a image in the canvas, but the image is loaded asynchronously.
 * If exist a image with the same tag, then the image is replaced.
 * If the image not exist, then a error is shown in canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 */
export async function showImageAsync(tag: string, imageUrl: string): Promise<CanvasImageAsync> {
    let image = new CanvasImageAsync(imageUrl)
    GameWindowManager.addChild(tag, image)
    return image.refreshImage().then(() => image)
}

/**
 * Get a texture from a url.
 * @param imageUrl is the url of the image.
 * @returns the texture of the image, or a text with the error.
 */
export function getPixiTexture(imageUrl: string): Texture | string {
    if (Assets.cache.has(imageUrl)) {
        return Assets.get(imageUrl)
    }
    let texture: Texture | undefined = undefined
    try {
        texture = Texture.from(imageUrl)
    }
    catch (e) {
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return STRING_ERRORS.IMAGE_NOT_FOUND
    }

    if (!texture) {
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return STRING_ERRORS.IMAGE_NOT_FOUND
    }
    // if texture not is a Texture, then it is a TextureResource
    if (!(texture instanceof Texture)) {
        console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
        return STRING_ERRORS.FILE_NOT_IS_IMAGE
    }

    return texture
}

/**
 * Get a texture from a url, but the image is loaded asynchronously.
 * @param imageUrl is the url of the image.
 * @returns the texture of the image, or a text with the error.
 */
export async function getPixiTextureAsync(imageUrl: string): Promise<Texture | string> {
    if (Assets.cache.has(imageUrl)) {
        return Assets.get(imageUrl)
    }
    return Assets.load(imageUrl)
        .then((texture) => {
            if (!texture) {
                console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
                return STRING_ERRORS.IMAGE_NOT_FOUND
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
                return STRING_ERRORS.FILE_NOT_IS_IMAGE
            }

            return texture
        })
        .catch(() => {
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return STRING_ERRORS.IMAGE_NOT_FOUND
        })
}

/**
 * Remove a image from the canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 */
export function removeImage(tag: string) {
    GameWindowManager.removeChild(tag)
}

/**
 * Show a image in the canvas with a effect.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @param effect The effect(Ticker) to show the image.
 * @returns The sprite of the image.
 */
export function showImageWithEffect(tag: string, imageUrl: string, effect: TickerBase<any>): CanvasImageBase {
    let image = showImage(tag, imageUrl)
    if (image) {
        GameWindowManager.addTicker(tag, effect)
    }
    return image
}

/**
 * Show a image in the canvas with a effect, but the image is loaded asynchronously.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @param effect The effect(Ticker) to show the image.
 * @returns The sprite of the image.
 */
export async function showImageAsyncWithEffect(tag: string, imageUrl: string, effect: TickerBase<any>): Promise<CanvasImageBase> {
    return showImageAsync(tag, imageUrl).then((image) => {
        GameWindowManager.addTicker(tag, effect)
        return image
    })
}

/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same tag, then the image is replaced. And the first image is removed after the effect is done.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @param args The arguments of the effect
 * @param duration The duration of the effect
 * @param priority The priority of the effect
 * @returns The sprite of the image.
 */
export function showImageWithDisolveEffect(
    tag: string, imageUrl: string,
    speed: number,
    priority?: UPDATE_PRIORITY,
): CanvasImageBase {
    if (!GameWindowManager.getChild(tag)) {
        let effect = new TickerFadeAlpha({
            speed: speed,
            type: "show",
        }, 10000, priority)
        return showImageWithEffect(tag, imageUrl, effect)
    }

    let specialTag = tag + "_temp_disolve"
    let effect = new TickerFadeAlpha({
        speed: speed,
        type: "show",
        tagToRemoveAfter: specialTag,
    }, 10000, priority)
    GameWindowManager.editTagChild(tag, specialTag)
    let image = showImage(tag, imageUrl)
    image.alpha = 0
    GameWindowManager.addTicker(tag, effect)
    return image
}

/**
 * Show a image in the canvas with a disolve effect, but the image is loaded asynchronously.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same tag, then the image is replaced. And the first image is removed after the effect is done.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @param args The arguments of the effect
 * @param duration The duration of the effect
 * @param priority The priority of the effect
 * @returns The sprite of the image.
 */
export async function showImageAsyncWithDisolveEffect(
    tag: string, imageUrl: string,
    speed: number,
    priority?: UPDATE_PRIORITY,
): Promise<CanvasImageBase> {
    if (!GameWindowManager.getChild(tag)) {
        let effect = new TickerFadeAlpha({
            speed: speed,
            type: "show",
        }, 10000, priority)
        return showImageAsyncWithEffect(tag, imageUrl, effect)
    }

    let specialTag = tag + "_temp_disolve"
    let effect = new TickerFadeAlpha({
        speed: speed,
        type: "show",
        tagToRemoveAfter: specialTag,
    }, 10000, priority)
    GameWindowManager.editTagChild(tag, specialTag)
    return showImageAsyncWithEffect(tag, imageUrl, effect)
        .then((image) => {
            image.alpha = 0
            return image
        })
        .catch((e) => {
            GameWindowManager.editTagChild(specialTag, tag)
            throw e
        })
}
