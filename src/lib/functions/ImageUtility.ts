import { Assets, Texture, UPDATE_PRIORITY } from 'pixi.js';
import { CanvasImage } from '../classes/canvas/CanvasImage';
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
export async function showImage(tag: string, imageUrl: string): Promise<CanvasImage> {
    let image = new CanvasImage()
    image.imageLink = imageUrl
    GameWindowManager.addCanvasElement(tag, image)
    return image.refreshImage().then(() => image)
}

/**
 * Add a image in the canvas.
 * Is the same that showImage, but the image is not shown.
 * If you want to show the image, then you need to use the function CanvasImage.refreshImage().
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 */
export function addImage(tag: string, imageUrl: string): CanvasImage {
    let image = new CanvasImage()
    image.imageLink = imageUrl
    GameWindowManager.addCanvasElement(tag, image)
    return image
}

/**
 * Show a list of images in the canvas, at the same time.
 * @param canvasImages is a list of images to show.
 * @returns the list of images.
 */
export async function showCanvasImages(canvasImages: CanvasImage[] | CanvasImage): Promise<CanvasImage[]> {
    if (!Array.isArray(canvasImages)) {
        return [canvasImages]
    }
    let promises: Promise<string | Texture>[] = Array<Promise<string | Texture>>(canvasImages.length)
    for (let i = 0; i < canvasImages.length; i++) {
        promises[i] = getTexture(canvasImages[i].imageLink)
    }
    // wait for all promises
    return Promise.all(promises).then((textures) => {
        return textures.map((texture, index) => {
            if (typeof texture === "string") {
                canvasImages[index].refreshImage()
                console.error(STRING_ERRORS.IMAGE_NOT_FOUND, canvasImages[index].imageLink)
                return canvasImages[index]
            }
            canvasImages[index].texture = texture
            return canvasImages[index]
        })
    })
}

/**
 * Get a texture from a url.
 * @param imageUrl is the url of the image.
 * @returns the texture of the image, or a text with the error.
 */
export async function getTexture(imageUrl: string): Promise<Texture | string> {
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
export function removeImage(tag: string | string[]) {
    GameWindowManager.removeCanvasElement(tag)
}

/**
 * Show a image in the canvas with a effect.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @param effect The effect(Ticker) to show the image.
 * @returns The sprite of the image.
 */
export async function showImageWithEffect(tag: string, imageUrl: string, effect: TickerBase<any>): Promise<CanvasImage> {
    return showImage(tag, imageUrl).then((image) => {
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
export async function showImageWithDisolveEffect(
    tag: string, imageUrl: string,
    speed: number,
    priority?: UPDATE_PRIORITY,
): Promise<CanvasImage> {
    if (!GameWindowManager.getCanvasElement(tag)) {
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
    GameWindowManager.editTagCanvasElement(tag, specialTag)
    return showImageWithEffect(tag, imageUrl, effect)
        .then((image) => {
            image.alpha = 0
            return image
        })
        .catch((e) => {
            GameWindowManager.editTagCanvasElement(specialTag, tag)
            throw e
        })
}
