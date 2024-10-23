import { UPDATE_PRIORITY } from "pixi.js"
import { CanvasBase, CanvasContainer, CanvasImage, CanvasSprite, CanvasVideo } from "../../classes"
import { FadeAlphaTicker, MoveTicker } from "../../classes/ticker"
import { ZoomInOutTicker } from "../../classes/ticker/ZoomTicker"
import { Pause } from "../../constants"
import { MoveInOutProps, ShowWithDissolveTransitionProps, ShowWithFadeTransitionProps, ZoomInOutProps } from "../../interface"
import { canvas } from "../../managers"
import { checkIfVideo } from "./CanvasUtility"
import { addImage } from "./ImageUtility"
import { addVideo } from "./VideoUtility"

/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, then the image is replaced and the first image is removed after the effect is done.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithDissolveTransition<T extends CanvasBase<any> | string = string>(
    alias: string,
    image: T,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let oldCanvasAlias: string | undefined = undefined
    if (canvas.find(alias)) {
        oldCanvasAlias = alias + "_temp_disolve"
        canvas.editAlias(alias, oldCanvasAlias)
    }

    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = addVideo(alias, image)
        }
        else {
            canvasElement = addImage(alias, image)
        }
    }
    else {
        canvasElement = image
        canvas.add(alias, canvasElement)
    }
    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }
    oldCanvasAlias && canvas.copyCanvasElementProperty(oldCanvasAlias, alias)
    oldCanvasAlias && canvas.transferTickers(oldCanvasAlias, alias, "duplicate")
    canvasElement.alpha = 0

    let effect = new FadeAlphaTicker({
        ...props,
        type: "show",
        aliasToRemoveAfter: oldCanvasAlias,
        startOnlyIfHaveTexture: true,
    }, 10, priority)
    canvas.addTicker(alias, effect)
    return
}

/**
 * Remove a image from the canvas with a disolve effect.
 * Disolve effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithFadeTransition}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export function removeWithDissolveTransition(
    alias: string | string[],
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): void {
    if (typeof alias === "string") {
        alias = [alias]
    }
    let effect = new FadeAlphaTicker({
        ...props,
        type: 'hide',
        aliasToRemoveAfter: alias,
        startOnlyIfHaveTexture: true,
    }, 10, priority)
    canvas.addTicker(alias, effect)
}

/**
 * Show a image in the canvas with a fade effect.
 * Fade effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, the existing image is removed with a fade transition, and after the effect is done, the new image is shown with a fade transition.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showWithFadeTransition<T extends CanvasBase<any> | string = string>(
    alias: string,
    image: T,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    if (!canvas.find(alias)) {
        return showWithDissolveTransition(alias, image, props, priority)
    }

    let oldCanvasAlias = alias + "_temp_fade"
    canvas.editAlias(alias, oldCanvasAlias)

    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = addVideo(alias, image)
        }
        else {
            canvasElement = addImage(alias, image)
        }
    }
    else {
        canvasElement = image
        canvas.add(alias, canvasElement)
    }
    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }
    oldCanvasAlias && canvas.copyCanvasElementProperty(oldCanvasAlias, alias)
    oldCanvasAlias && canvas.transferTickers(oldCanvasAlias, alias, "duplicate")
    canvasElement.alpha = 0

    canvas.addTickersSteps(oldCanvasAlias, [
        new FadeAlphaTicker({
            ...props,
            type: "hide",
            startOnlyIfHaveTexture: true,
        }, undefined, priority),
    ])
    canvas.addTickersSteps(alias, [
        Pause(props.duration || 1),
        new FadeAlphaTicker({
            ...props,
            type: "show",
            startOnlyIfHaveTexture: true,
            aliasToRemoveAfter: oldCanvasAlias,
        }, undefined, priority)
    ])
}

/**
 * Remove a image from the canvas with a fade effect.
 * Fade effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithDissolveTransition}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export function removeWithFadeTransition(
    alias: string | string[],
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): void {
    return removeWithDissolveTransition(alias, props, priority)
}

/**
 * Show a image in the canvas with a move effect. The image is moved from outside the canvas to the x and y position of the image.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export async function moveIn<T extends CanvasBase<any> | string = string>(
    alias: string,
    image: T,
    props: MoveInOutProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<void> {
    let direction = props.direction || "right"
    let canvasElement: CanvasBase<any>
    if (typeof image === "string") {
        if (checkIfVideo(image)) {
            canvasElement = addVideo(alias, image)
        }
        else {
            canvasElement = addImage(alias, image)
        }
    }
    else {
        canvasElement = image
        canvas.add(alias, canvasElement)
    }
    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }

    let destination = { x: canvasElement.x, y: canvasElement.y }
    switch (direction) {
        case "up":
            canvasElement.y = canvas.canvasHeight + canvasElement.height
            break
        case "down":
            canvasElement.y = -(canvasElement.height)
            break
        case "left":
            canvasElement.x = canvas.canvasWidth + canvasElement.width
            break
        case "right":
            canvasElement.x = -(canvasElement.width)
            break
    }

    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
    }, undefined, priority)

    canvas.addTicker(alias, effect)
}

/**
 * Remove a image from the canvas with a move effect. The image is moved from the x and y position of the image to outside the canvas.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export function moveOut(
    alias: string,
    props: MoveInOutProps = {},
    priority?: UPDATE_PRIORITY,
): void {
    let direction = props.direction || "right"
    let canvasElement = canvas.find(alias)
    if (!canvasElement) {
        console.warn("[Pixi’VN] The canvas element is not found.")
        return
    }

    let destination = { x: canvasElement.x, y: canvasElement.y }
    switch (direction) {
        case "up":
            destination.y = -(canvasElement.height)
            break
        case "down":
            destination.y = canvas.canvasHeight + canvasElement.height
            break
        case "left":
            destination.x = -(canvasElement.width)
            break
        case "right":
            destination.x = canvas.canvasWidth + canvasElement.width
            break
    }

    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
        aliasToRemoveAfter: alias,
    }, undefined, priority)

    canvas.addTicker(alias, effect)
}

/**
 * Show a image in the canvas with a zoom effect. The image is zoomed in from the center of the canvas.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 */
export async function zoomIn<T extends CanvasSprite | string = string>(
    alias: string,
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
    canvas.add(alias, container)

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
    }, undefined, priority)

    canvas.addTicker(alias, effect)
}

/**
 * Remove a image from the canvas with a zoom effect. The image is zoomed out to the center of the canvas.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that is resolved when the image is loaded.
 */
export function zoomOut(
    alias: string,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
) {
    let canvasElement = canvas.find(alias)
    if (!canvasElement) {
        console.warn("[Pixi’VN] The canvas element is not found.")
        return
    }

    let container = new CanvasContainer()
    container.addChild(canvasElement)
    container.height = canvas.canvasHeight
    container.width = canvas.canvasWidth
    canvas.add(alias, container)

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
        aliasToRemoveAfter: alias,
    }, undefined, priority)

    canvas.addTicker(alias, effect)
}
