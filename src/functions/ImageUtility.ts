import { Texture, UPDATE_PRIORITY } from 'pixi.js';
import { CanvasBase, CanvasImage } from '../classes/canvas';
import { FadeAlphaTicker, MoveTicker } from '../classes/ticker';
import { Pause } from '../constants';
import { GameWindowManager } from '../managers';
import { FadeAlphaTickerProps, MoveTickerProps } from '../types/ticker';
import { tagToRemoveAfterType } from '../types/ticker/TagToRemoveAfterType';
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
 * If exist a image with the same tag, then the image is replaced and the first image is removed after the effect is done.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithDissolveTransition<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    props: Omit<FadeAlphaTickerProps, "type" | tagToRemoveAfterType | "startOnlyIfHaveTexture"> = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let oldCanvasTag: string | undefined = undefined
    if (GameWindowManager.getCanvasElement(tag)) {
        oldCanvasTag = tag + "_temp_disolve"
        GameWindowManager.editCanvasElementTag(tag, oldCanvasTag)
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

    let effect = new FadeAlphaTicker({
        ...props,
        type: "show",
        tagToRemoveAfter: oldCanvasTag,
        startOnlyIfHaveTexture: true,
    }, 10, priority)
    GameWindowManager.addTicker(tag, effect)
    return
}

/**
 * Remove a image from the canvas with a disolve effect.
 * Disolve effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithFadeTransition}.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export function removeWithDissolveTransition(
    tag: string | string[],
    props: Omit<FadeAlphaTickerProps, "type" | tagToRemoveAfterType | "startOnlyIfHaveTexture"> = {},
    priority?: UPDATE_PRIORITY,
): void {
    if (typeof tag === "string") {
        tag = [tag]
    }
    let effect = new FadeAlphaTicker({
        ...props,
        type: 'hide',
        tagToRemoveAfter: tag,
        startOnlyIfHaveTexture: true,
    }, 10, priority)
    GameWindowManager.addTicker(tag, effect)
}

/**
 * Show a image in the canvas with a fade effect.
 * Fade effect is a effect that the image is shown with a fade in.
 * If exist a image with the same tag, the existing image is removed with a fade transition, and after the effect is done, the new image is shown with a fade transition.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithFadeTransition<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    props: Omit<FadeAlphaTickerProps, "type" | tagToRemoveAfterType | "startOnlyIfHaveTexture"> = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    if (!GameWindowManager.getCanvasElement(tag)) {
        return showWithDissolveTransition(tag, image, props, priority)
    }

    let oldCanvasTag = tag + "_temp_fade"
    GameWindowManager.editCanvasElementTag(tag, oldCanvasTag)

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

    GameWindowManager.addTickersSteps(oldCanvasTag, [
        new FadeAlphaTicker({
            ...props,
            type: "hide",
            startOnlyIfHaveTexture: true,
        }),
    ])
    GameWindowManager.addTickersSteps(tag, [
        Pause(props.duration || 1),
        new FadeAlphaTicker({
            ...props,
            type: "show",
            startOnlyIfHaveTexture: true,
        })
    ])
}

/**
 * Remove a image from the canvas with a fade effect.
 * Fade effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithDissolveTransition}.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export function removeWithFadeTransition(
    tag: string | string[],
    props: Omit<FadeAlphaTickerProps, "type" | tagToRemoveAfterType | "startOnlyIfHaveTexture"> = {},
    priority?: UPDATE_PRIORITY,
): void {
    return removeWithDissolveTransition(tag, props, priority)
}

export async function moveIn<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    props: Omit<MoveTickerProps, tagToRemoveAfterType | "startOnlyIfHaveTexture" | "destination"> & {
        direction: "up" | "down" | "left" | "right",
    } = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): Promise<void> {
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

    let destination = { x: canvasElement.x, y: canvasElement.y }

    if (props.direction == "up") {
        canvasElement.y = GameWindowManager.canvasHeight + canvasElement.height
    }
    else if (props.direction == "down") {
        canvasElement.y = -(canvasElement.height)
    }
    else if (props.direction == "left") {
        canvasElement.x = GameWindowManager.canvasWidth + canvasElement.width
    }
    else if (props.direction == "right") {
        canvasElement.x = -(canvasElement.width)
    }

    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
    }, priority)

    GameWindowManager.addTicker(tag, effect)
}

export function moveOut(
    tag: string,
    props: Omit<MoveTickerProps, tagToRemoveAfterType | "startOnlyIfHaveTexture" | "destination"> & {
        direction: "up" | "down" | "left" | "right",
    } = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): void {
    let canvasElement = GameWindowManager.getCanvasElement(tag)
    if (!canvasElement) {
        return
    }

    let destination = { x: canvasElement.x, y: canvasElement.y }
    if (props.direction == "up") {
        destination.y = -(canvasElement.height)
    }
    else if (props.direction == "down") {
        destination.y = GameWindowManager.canvasHeight + canvasElement.height
    }
    else if (props.direction == "left") {
        destination.x = -(canvasElement.width)
    }
    else if (props.direction == "right") {
        destination.x = GameWindowManager.canvasWidth + canvasElement.width
    }

    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
        tagToRemoveAfter: tag,
    }, priority)

    GameWindowManager.addTicker(tag, effect)
}
