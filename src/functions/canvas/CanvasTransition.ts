import { UPDATE_PRIORITY } from "pixi.js"
import { CanvasBase, CanvasContainer, CanvasImage, CanvasSprite, CanvasVideo } from "../../classes"
import { FadeAlphaTicker, MoveTicker } from "../../classes/ticker"
import { ZoomInOutTicker } from "../../classes/ticker/ZoomTicker"
import { Pause } from "../../constants"
import { canvas } from "../../managers"
import { FadeAlphaTickerProps, MoveTickerProps, ZoomTickerProps } from "../../types/ticker"
import { tagToRemoveAfterType } from "../../types/ticker/TagToRemoveAfterType"
import { checkIfVideo } from "./CanvasUtility"
import { addImage } from "./ImageUtility"
import { addVideo } from "./VideoUtility"

export type ShowWithDissolveTransitionProps = Omit<FadeAlphaTickerProps, "type" | tagToRemoveAfterType | "startOnlyIfHaveTexture">
/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same tag, then the image is replaced and the first image is removed after the effect is done.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithDissolveTransition<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let oldCanvasTag: string | undefined = undefined
    if (canvas.find(tag)) {
        oldCanvasTag = tag + "_temp_disolve"
        canvas.editAlias(tag, oldCanvasTag)
    }

    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = addVideo(tag, image)
        }
        else {
            canvasElement = addImage(tag, image)
        }
    }
    else {
        canvasElement = image
        canvas.add(tag, canvasElement)
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
    canvas.addTicker(tag, effect)
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
    props: ShowWithDissolveTransitionProps = {},
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
    canvas.addTicker(tag, effect)
}

export type ShowWithFadeTransitionProps = Omit<FadeAlphaTickerProps, "type" | tagToRemoveAfterType | "startOnlyIfHaveTexture">
/**
 * Show a image in the canvas with a fade effect.
 * Fade effect is a effect that the image is shown with a fade in.
 * If exist a image with the same tag, the existing image is removed with a fade transition, and after the effect is done, the new image is shown with a fade transition.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithFadeTransition<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    if (!canvas.find(tag)) {
        return showWithDissolveTransition(tag, image, props, priority)
    }

    let oldCanvasTag = tag + "_temp_fade"
    canvas.editAlias(tag, oldCanvasTag)

    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = addVideo(tag, image)
        }
        else {
            canvasElement = addImage(tag, image)
        }
    }
    else {
        canvasElement = image
        canvas.add(tag, canvasElement)
    }
    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }
    canvasElement.alpha = 0

    canvas.addTickersSteps(oldCanvasTag, [
        new FadeAlphaTicker({
            ...props,
            type: "hide",
            startOnlyIfHaveTexture: true,
        }),
    ])
    canvas.addTickersSteps(tag, [
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
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): void {
    return removeWithDissolveTransition(tag, props, priority)
}

export type MoveInOutProps = {
    /**
     * The direction of the movement.
     */
    direction: "up" | "down" | "left" | "right",
} & Omit<MoveTickerProps, tagToRemoveAfterType | "startOnlyIfHaveTexture" | "destination">

/**
 * Show a image in the canvas with a move effect. The image is moved from outside the canvas to the x and y position of the image.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function moveIn<T extends CanvasBase<any> | string = string>(
    tag: string,
    image: T,
    props: MoveInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = addVideo(tag, image)
        }
        else {
            canvasElement = addImage(tag, image)
        }
    }
    else {
        canvasElement = image
        canvas.add(tag, canvasElement)
    }
    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }

    let destination = { x: canvasElement.x, y: canvasElement.y }

    if (props.direction == "up") {
        canvasElement.y = canvas.canvasHeight + canvasElement.height
    }
    else if (props.direction == "down") {
        canvasElement.y = -(canvasElement.height)
    }
    else if (props.direction == "left") {
        canvasElement.x = canvas.canvasWidth + canvasElement.width
    }
    else if (props.direction == "right") {
        canvasElement.x = -(canvasElement.width)
    }

    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
    }, priority)

    canvas.addTicker(tag, effect)
}

/**
 * Remove a image from the canvas with a move effect. The image is moved from the x and y position of the image to outside the canvas.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export function moveOut(
    tag: string,
    props: MoveInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): void {
    let canvasElement = canvas.find(tag)
    if (!canvasElement) {
        console.warn("[Pixi'VN] The canvas element is not found.")
        return
    }

    let destination = { x: canvasElement.x, y: canvasElement.y }
    if (props.direction == "up") {
        destination.y = -(canvasElement.height)
    }
    else if (props.direction == "down") {
        destination.y = canvas.canvasHeight + canvasElement.height
    }
    else if (props.direction == "left") {
        destination.x = -(canvasElement.width)
    }
    else if (props.direction == "right") {
        destination.x = canvas.canvasWidth + canvasElement.width
    }

    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
        tagToRemoveAfter: tag,
    }, priority)

    canvas.addTicker(tag, effect)
}

export type ZoomInOutProps = {
    /**
     * The direction of the zoom effect.
     */
    direction: "up" | "down" | "left" | "right",
} & Omit<ZoomTickerProps, tagToRemoveAfterType | "startOnlyIfHaveTexture" | "type">

/**
 * Show a image in the canvas with a zoom effect. The image is zoomed in from the center of the canvas.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export async function zoomIn<T extends CanvasSprite | string = string>(
    tag: string,
    image: T,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
) {
    let canvasElement: CanvasSprite
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = new CanvasVideo({}, image)
        }
        else {
            canvasElement = new CanvasImage({}, image)
        }
    }
    else {
        canvasElement = image
    }

    let container = new CanvasContainer()
    container.addChild(canvasElement)
    container.height = canvas.canvasHeight
    container.width = canvas.canvasWidth
    canvas.add(tag, container)

    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }

    if (props.direction == "up") {
        container.pivot.y = canvas.canvasHeight
        container.pivot.x = canvas.canvasWidth / 2
        container.y = canvas.canvasHeight
        container.x = canvas.canvasWidth / 2
    }
    else if (props.direction == "down") {
        container.pivot.y = 0
        container.pivot.x = canvas.canvasWidth / 2
        container.y = 0
        container.x = canvas.canvasWidth / 2
    }
    else if (props.direction == "left") {
        container.pivot.x = canvas.canvasWidth
        container.pivot.y = canvas.canvasHeight / 2
        container.x = canvas.canvasWidth
        container.y = canvas.canvasHeight / 2
    }
    else if (props.direction == "right") {
        container.pivot.x = 0
        container.pivot.y = canvas.canvasHeight / 2
        container.x = 0
        container.y = canvas.canvasHeight / 2
    }
    container.scale.set(0)

    let effect = new ZoomInOutTicker({
        ...props,
        startOnlyIfHaveTexture: true,
        type: "zoom",
        limit: 1,
    }, priority)

    canvas.addTicker(tag, effect)
}

/**
 * Remove a image from the canvas with a zoom effect. The image is zoomed out to the center of the canvas.
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export function zoomOut(
    tag: string,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
) {
    let canvasElement = canvas.find(tag)
    if (!canvasElement) {
        console.warn("[Pixi'VN] The canvas element is not found.")
        return
    }

    let container = new CanvasContainer()
    container.addChild(canvasElement)
    container.height = canvas.canvasHeight
    container.width = canvas.canvasWidth
    canvas.add(tag, container)

    if (props.direction == "up") {
        container.pivot.y = canvas.canvasHeight
        container.pivot.x = canvas.canvasWidth / 2
        container.y = canvas.canvasHeight
        container.x = canvas.canvasWidth / 2
    }
    else if (props.direction == "down") {
        container.pivot.y = 0
        container.pivot.x = canvas.canvasWidth / 2
        container.y = 0
        container.x = canvas.canvasWidth / 2
    }
    else if (props.direction == "left") {
        container.pivot.x = canvas.canvasWidth
        container.pivot.y = canvas.canvasHeight / 2
        container.x = canvas.canvasWidth
        container.y = canvas.canvasHeight / 2
    }
    else if (props.direction == "right") {
        container.pivot.x = 0
        container.pivot.y = canvas.canvasHeight / 2
        container.x = 0
        container.y = canvas.canvasHeight / 2
    }
    container.scale.set(1)

    let effect = new ZoomInOutTicker({
        ...props,
        startOnlyIfHaveTexture: true,
        type: "unzoom",
        limit: 0,
        tagToRemoveAfter: tag,
    }, priority)

    canvas.addTicker(tag, effect)
}
