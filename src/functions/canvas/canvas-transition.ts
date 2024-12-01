import { UPDATE_PRIORITY } from "pixi.js"
import { CanvasBaseItem, CanvasImage, CanvasVideo, Container } from "../../classes"
import { FadeAlphaTicker, MoveTicker, ZoomTicker } from "../../classes/ticker"
import { Pause } from "../../constants"
import { MoveInOutProps, ShowWithDissolveTransitionProps, ShowWithFadeTransitionProps, ZoomInOutProps } from "../../interface"
import { canvas } from "../../managers"
import { checkIfVideo } from "./canvas-utility"
import { addImage } from "./image-utility"
import { addVideo } from "./video-utility"

/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, then the image is replaced and the first image is removed after the effect is done.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function showWithDissolveTransition<T extends CanvasBaseItem<any> | string = string>(
    alias: string,
    image: T,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let oldCanvasAlias: string | undefined = undefined
    if (canvas.find(alias)) {
        oldCanvasAlias = alias + "_temp_disolve"
        canvas.editAlias(alias, oldCanvasAlias)
    }

    let canvasElement: CanvasBaseItem<any>
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
    let id = canvas.addTicker(alias, effect)
    if (id) {
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Remove a image from the canvas with a disolve effect.
 * Disolve effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithFadeTransition}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function removeWithDissolveTransition(
    alias: string | string[],
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    if (typeof alias === "string") {
        alias = [alias]
    }
    let effect = new FadeAlphaTicker({
        ...props,
        type: 'hide',
        aliasToRemoveAfter: alias,
        startOnlyIfHaveTexture: true,
    }, 10, priority)
    let id = canvas.addTicker(alias, effect)
    if (id) {
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Show a image in the canvas with a fade effect.
 * Fade effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, the existing image is removed with a fade transition, and after the effect is done, the new image is shown with a fade transition.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function showWithFadeTransition<T extends CanvasBaseItem<any> | string = string>(
    alias: string,
    image: T,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    if (!canvas.find(alias)) {
        return showWithDissolveTransition(alias, image, props, priority)
    }

    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let oldCanvasAlias = alias + "_temp_fade"
    canvas.editAlias(alias, oldCanvasAlias)

    let canvasElement: CanvasBaseItem<any>
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

    let id1 = canvas.addTickersSteps(oldCanvasAlias, [
        new FadeAlphaTicker({
            ...props,
            type: "hide",
            startOnlyIfHaveTexture: true,
        }, undefined, priority),
    ])
    let id2 = canvas.addTickersSteps(alias, [
        Pause(props.duration || 1),
        new FadeAlphaTicker({
            ...props,
            type: "show",
            startOnlyIfHaveTexture: true,
            aliasToRemoveAfter: oldCanvasAlias,
        }, undefined, priority)
    ])
    let res: undefined | string[] = undefined
    if (id1) {
        res = [id1]
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id1, alias: alias })
    }
    if (id2) {
        res ? res.push(id2) : res = [id2]
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id2, alias: alias })
    }
    return res
}

/**
 * Remove a image from the canvas with a fade effect.
 * Fade effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithDissolveTransition}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function removeWithFadeTransition(
    alias: string | string[],
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return removeWithDissolveTransition(alias, props, priority)
}

/**
 * Show a image in the canvas with a move effect. The image is moved from outside the canvas to the x and y position of the image.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function moveIn<T extends CanvasBaseItem<any> | string = string>(
    alias: string,
    image: T,
    props: MoveInOutProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let direction = props.direction || "right"
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let tickerAliasToResume = typeof props.tickerAliasToResume === "string" ? [props.tickerAliasToResume] : props.tickerAliasToResume || []
    tickerAliasToResume.push(alias)
    let canvasElement: CanvasBaseItem<any>
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
        tickerAliasToResume: tickerAliasToResume,
        destination,
        startOnlyIfHaveTexture: true,
    }, undefined, priority)

    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, id)
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Remove a image from the canvas with a move effect. The image is moved from the x and y position of the image to outside the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function moveOut(
    alias: string,
    props: MoveInOutProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    let direction = props.direction || "right"
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let tickerAliasToResume = typeof props.tickerAliasToResume === "string" ? [props.tickerAliasToResume] : props.tickerAliasToResume || []
    tickerAliasToResume.push(alias)
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
        tickerAliasToResume: tickerAliasToResume,
        destination,
        startOnlyIfHaveTexture: true,
        aliasToRemoveAfter: alias,
    }, undefined, priority)

    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, id)
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Show a image in the canvas with a zoom effect. The image is zoomed in from the center of the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function zoomIn<T extends CanvasBaseItem<any> | string = string>(
    alias: string,
    image: T,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let tickerAliasToResume = typeof props.tickerAliasToResume === "string" ? [props.tickerAliasToResume] : props.tickerAliasToResume || []
    tickerAliasToResume.push(alias)
    let canvasElement: CanvasBaseItem<any>
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

    if (canvas.find(alias)) {
        canvas.copyCanvasElementProperty(alias, canvasElement)
    }
    let container = new Container()
    container.addChild(canvasElement)
    container.height = canvas.canvasHeight
    container.width = canvas.canvasWidth
    canvas.add(alias, container, { ignoreOldStyle: true })

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

    let effect = new ZoomTicker({
        ...props,
        tickerAliasToResume: tickerAliasToResume,
        startOnlyIfHaveTexture: true,
        type: "zoom",
        limit: 1,
        isZoomInOut: true,
    }, undefined, priority)

    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, id)
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Remove a image from the canvas with a zoom effect. The image is zoomed out to the center of the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function zoomOut(
    alias: string,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let tickerAliasToResume = typeof props.tickerAliasToResume === "string" ? [props.tickerAliasToResume] : props.tickerAliasToResume || []
    tickerAliasToResume.push(alias)
    let canvasElement = canvas.find(alias)
    if (!canvasElement) {
        console.warn("[Pixi’VN] The canvas element is not found.")
        return
    }

    let container = new Container()
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

    let effect = new ZoomTicker({
        ...props,
        tickerAliasToResume: tickerAliasToResume,
        startOnlyIfHaveTexture: true,
        type: "unzoom",
        limit: 0,
        aliasToRemoveAfter: alias,
        isZoomInOut: true,
    }, undefined, priority)

    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, id)
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Show a image in the canvas with a push effect. The new image is pushed in from the inside of the canvas and the old image is pushed out to the outside of the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param image The imageUrl or the canvas element. If imageUrl is a video, then the {@link CanvasVideo} is added to the canvas.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function pushIn<T extends CanvasBaseItem<any> | string = string>(
    alias: string,
    image: T,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let oldCanvasAlias = alias + "_temp_push"
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let tickerAliasToResume = typeof props.tickerAliasToResume === "string" ? [props.tickerAliasToResume] : props.tickerAliasToResume || []
    tickerAliasToResume.push(alias)
    let canvasElement: CanvasBaseItem<any>
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

    let oldCanvas = canvas.find(alias)
    if (oldCanvas) {
        canvas.copyCanvasElementProperty(oldCanvas, canvasElement)
        canvas.editAlias(alias, oldCanvasAlias, { ignoreTickers: true })
        pushOut(oldCanvasAlias, props, priority)
    }

    let container = new Container()
    container.height = canvas.canvasHeight
    container.width = canvas.canvasWidth
    container.addChild(canvasElement)
    canvas.add(alias, container, { ignoreOldStyle: true })

    if (canvasElement instanceof CanvasImage && canvasElement.texture?.label == "EMPTY") {
        await canvasElement.load()
    }

    if (props.direction == "up") {
        container.x = 0
        container.y = -canvas.canvasHeight
    }
    else if (props.direction == "down") {
        container.x = 0
        container.y = canvas.canvasHeight
    }
    else if (props.direction == "left") {
        container.x = canvas.canvasWidth
        container.y = 0
    }
    else if (props.direction == "right") {
        container.x = -canvas.canvasWidth
        container.y = 0
    }

    let effect = new MoveTicker({
        ...props,
        tickerAliasToResume: tickerAliasToResume,
        startOnlyIfHaveTexture: true,
        isPushInOut: true,
        destination: { x: 0, y: 0 }
    }, undefined, priority)

    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, id)
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}

/**
 * Remove a image from the canvas with a push effect. The image is pushed out to the outside of the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function pushOut(
    alias: string,
    props: ZoomInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    let mustBeCompletedBeforeNextStep = props.mustBeCompletedBeforeNextStep ?? true
    let tickerAliasToResume = typeof props.tickerAliasToResume === "string" ? [props.tickerAliasToResume] : props.tickerAliasToResume || []
    tickerAliasToResume.push(alias)
    let canvasElement = canvas.find(alias)
    if (!canvasElement) {
        console.warn("[Pixi’VN] The canvas element is not found.")
        return
    }

    let container = new Container()
    container.pivot.x = 0
    container.pivot.y = 0
    container.x = 0
    container.y = 0
    container.addChild(canvasElement)
    canvas.add(alias, container, { ignoreOldStyle: true })

    let destination = { x: 0, y: 0 }

    if (props.direction == "up") {
        destination.y = canvas.canvasHeight
    }
    else if (props.direction == "down") {
        destination.y = -canvas.canvasHeight
    }
    else if (props.direction == "left") {
        destination.x = -canvas.canvasWidth
    }
    else if (props.direction == "right") {
        destination.x = canvas.canvasWidth
    }

    let effect = new MoveTicker({
        ...props,
        tickerAliasToResume: tickerAliasToResume,
        startOnlyIfHaveTexture: true,
        destination: destination,
        aliasToRemoveAfter: alias,
        isPushInOut: true,
    }, undefined, priority)

    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, id)
        mustBeCompletedBeforeNextStep && canvas.addTickerMustBeCompletedBeforeNextStep({ id: id })
        return [id]
    }
}
