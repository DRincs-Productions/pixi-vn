import { Texture, UPDATE_PRIORITY } from 'pixi.js';
import { CanvasBase, CanvasImage } from '../classes/canvas';
import { TickerFadeAlpha } from '../classes/ticker';
import { GameWindowManager } from '../managers';
import { getTexture } from './TextureUtility';

/**
 * Add a image in the canvas.
 * Is the same that showImage, but the image is not shown.
 * If you want to show the image, then you need to use the function CanvasImage.load().
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 * @example
 * ```typescript
 * let alien = addImage("bunny1", "https://pixijs.com/assets/eggHead.png")
 * await alien.load()
 * ```
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
export async function loadImage(canvasImages: CanvasImage[] | CanvasImage): Promise<CanvasImage[]> {
    if (!Array.isArray(canvasImages)) {
        return [canvasImages]
    }
    let promises: Promise<void | Texture>[] = Array<Promise<void | Texture>>(canvasImages.length)
    for (let i = 0; i < canvasImages.length; i++) {
        promises[i] = getTexture(canvasImages[i].imageLink)
    }
    // wait for all promises
    return Promise.all(promises).then((textures) => {
        return textures.map((texture, index) => {
            if (texture) {
                canvasImages[index].texture = texture
                return canvasImages[index]
            }
            canvasImages[index].load()
            return canvasImages[index]
        })
    })
}

/**
 * Add and show a image in the canvas. This function is a combination of {@link addImage} and {@link loadImage}.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showImage(tag: string, imageUrl: string): Promise<CanvasImage> {
    let image = addImage(tag, imageUrl)
    await image.load()
    return image
}

/**
 * Remove a image from the canvas.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 */
export function removeCanvasElement(tag: string | string[]) {
    GameWindowManager.removeCanvasElement(tag)
}

/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same tag, then the image is replaced. And the first image is removed after the effect is done.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element
 * @param duration The duration of the effect, in seconds
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithDissolveTransition<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    duration: number,
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let specialTag: string | undefined = undefined
    if (GameWindowManager.getCanvasElement(tag)) {
        specialTag = tag + "_temp_disolve"
        GameWindowManager.editTagCanvasElement(tag, specialTag)
    }

    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        canvasElement = addImage(tag, image)
    }
    else {
        canvasElement = image
        GameWindowManager.addCanvasElement(tag, canvasElement)
    }
    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }
    canvasElement.alpha = 0

    let effect = new TickerFadeAlpha({
        duration: duration,
        type: "show",
        tagToRemoveAfter: specialTag,
        startOnlyIfHaveTexture: true,
    }, 10000, priority)
    GameWindowManager.addTicker(tag, effect)
    return
}

/**
 * Remove a image from the canvas with a disolve effect.
 * Disolve effect is a effect that the image is removed with a fade out.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param duration The duration of the effect, in seconds
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is removed.
 */
export async function removeWithDissolveTransition(
    tag: string | string[],
    duration: number,
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    if (typeof tag === "string") {
        tag = [tag]
    }
    let effect = new TickerFadeAlpha({
        duration: duration,
        type: 'hide',
        tagToRemoveAfter: tag,
        startOnlyIfHaveTexture: true,
    }, 10000, priority)
    GameWindowManager.addTicker(tag, effect)
}
