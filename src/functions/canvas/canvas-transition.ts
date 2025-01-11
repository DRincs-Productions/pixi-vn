import { UPDATE_PRIORITY } from "pixi.js"
import { CanvasBaseItem, ImageSprite, VideoSprite } from "../../classes"
import ImageContainer from "../../classes/canvas/ImageContainer"
import { FadeAlphaTicker, MoveTicker, ZoomTicker } from "../../classes/ticker"
import { ImageContainerOptions, ImageSpriteOptions, MoveInOutProps, ShowWithDissolveTransitionProps, ShowWithFadeTransitionProps, ZoomInOutProps } from "../../interface"
import { PushInOutProps } from "../../interface/canvas/transition-props"
import { canvas } from "../../managers"
import { getPivotBySuperPivot } from "./canvas-property-utility"
import { checkIfVideo } from "./canvas-utility"
import { addImageCointainer } from "./image-container-utility"
import { addImage } from "./image-utility"
import { addVideo } from "./video-utility"

type TComponent = CanvasBaseItem<any> | string | string[] | {
    value: string,
    options: ImageSpriteOptions
} | {
    value: string[],
    options: ImageContainerOptions
}
function addComponent(alias: string, canvasElement: TComponent): CanvasBaseItem<any> {
    if (typeof canvasElement === "string") {
        if (checkIfVideo(canvasElement)) {
            return addVideo(alias, canvasElement)
        }
        else {
            return addImage(alias, canvasElement)
        }
    }
    else if (Array.isArray(canvasElement)) {
        return addImageCointainer(alias, canvasElement)
    }
    else if (typeof canvasElement === "object" && "value" in canvasElement && "options" in canvasElement) {
        if (typeof canvasElement.value === "string") {
            if (checkIfVideo(canvasElement.value)) {
                return addVideo(alias, canvasElement.value, canvasElement.options)
            }
            else {
                return addImage(alias, canvasElement.value, canvasElement.options)
            }
        }
        else if (Array.isArray(canvasElement.value)) {
            return addImageCointainer(alias, canvasElement.value, canvasElement.options as any)
        }
    }
    canvas.add(alias, canvasElement as CanvasBaseItem<any>)
    return canvasElement as CanvasBaseItem<any>
}

/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, then the image is replaced and the first image is removed after the effect is done.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
 * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
 * If you don't provide the component, then the alias is used as the url.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function showWithDissolve(
    alias: string,
    component?: TComponent,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let { mustBeCompletedBeforeNextStep = true, tickerAliasToResume = [] } = props
    let res: string[] = []
    if (!component) {
        component = alias
    }
    if (typeof tickerAliasToResume === "string") {
        tickerAliasToResume = [tickerAliasToResume]
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_disolve"
        canvas.editAlias(alias, oldComponentAlias)
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component)
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias)
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "duplicate")
    // edit the properties of the new component
    component.alpha = 0
    // remove the old component
    if (oldComponentAlias) {
        let ids = removeWithDissolve(oldComponentAlias, props, priority)
        if (ids) {
            res.push(...ids)
            canvas.putOnPauseTicker(oldComponentAlias, { tickerIdsIncluded: ids })
            tickerAliasToResume.push(oldComponentAlias)
        }
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let effect = new FadeAlphaTicker({
        ...props,
        type: "show",
        tickerAliasToResume,
        startOnlyIfHaveTexture: true,
    }, undefined, priority)
    let idShow = canvas.addTicker(alias, effect)
    if (idShow) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow })
        res.push(idShow)
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load()
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res
    }
}

/**
 * Remove a image from the canvas with a disolve effect.
 * Disolve effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithFade}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function removeWithDissolve(
    alias: string | string[],
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    let { mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [] } = props
    if (typeof alias === "string") {
        alias = [alias]
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter]
    }
    aliasToRemoveAfter.push(...alias)
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let effect = new FadeAlphaTicker({
        ...props,
        type: 'hide',
        aliasToRemoveAfter,
        startOnlyIfHaveTexture: true,
    }, undefined, priority)
    let id = canvas.addTicker(alias, effect)
    if (id) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: id })
        return [id]
    }
}

/**
 * Show a image in the canvas with a fade effect.
 * Fade effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, the existing image is removed with a fade transition, and after the effect is done, the new image is shown with a fade transition.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
 * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
 * If you don't provide the component, then the alias is used as the url.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function showWithFade(
    alias: string,
    component?: TComponent,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let { mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [] } = props
    let res: string[] = []
    if (!component) {
        component = alias
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter]
    }
    // check if the alias is already exist
    if (!canvas.find(alias)) {
        return showWithDissolve(alias, component, props, priority)
    }
    let oldComponentAlias = alias + "_temp_fade"
    canvas.editAlias(alias, oldComponentAlias)
    aliasToRemoveAfter.push(oldComponentAlias)
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component)
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias)
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "duplicate")
    // edit the properties of the new component
    component.alpha = 0
    // remove the old component
    let idHide = removeWithDissolve(oldComponentAlias, {
        ...props,
        tickerAliasToResume: alias,
    }, priority)
    if (idHide) {
        res.push(...idHide)
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let effect = new FadeAlphaTicker({
        ...props,
        type: "show",
        startOnlyIfHaveTexture: true,
        aliasToRemoveAfter,
    }, undefined, priority)
    let idShow = canvas.addTicker(alias, effect)
    if (idShow) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow })
        res.push(idShow)
        // pause the ticker
        canvas.putOnPauseTicker(alias, { tickerIdsIncluded: [idShow] })
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load()
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res
    }
}

/**
 * Remove a image from the canvas with a fade effect.
 * Fade effect is a effect that the image is removed with a fade out.
 * This transition is done with a {@link FadeAlphaTicker} effect.
 * This function is equivalent to {@link removeWithDissolve}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function removeWithFade(
    alias: string | string[],
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return removeWithDissolve(alias, props, priority)
}

/**
 * Show a image in the canvas with a move effect. The image is moved from outside the canvas to the x and y position of the image.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
 * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
 * If you don't provide the component, then the alias is used as the url.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function moveIn(
    alias: string,
    component?: TComponent,
    props: MoveInOutProps & {
        /**
         * If true, then the old component is removed with a move out, after the new image is moved in.
         * @default false
         */
        removeOldComponentWithMoveOut?: boolean,
    } = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, tickerAliasToResume = [], aliasToRemoveAfter = [], removeOldComponentWithMoveOut } = props
    let res: string[] = []
    if (!component) {
        component = alias
    }
    if (typeof tickerAliasToResume === "string") {
        tickerAliasToResume = [tickerAliasToResume]
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter]
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_movein"
        canvas.editAlias(alias, oldComponentAlias)
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component)
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias)
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "move")
    // edit the properties of the new component
    let destination: { x: number, y: number, type: "pixel" | "percentage" | "align" }
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        destination = component.positionInfo
    }
    else {
        destination = { x: component.x, y: component.y, type: "pixel" }
    }
    // remove the old component
    let ids: string[] | undefined = undefined
    if (oldComponentAlias) {
        if (removeOldComponentWithMoveOut) {
            ids = moveOut(oldComponentAlias, props, priority)
            if (ids) {
                res.push(...ids)
                tickerAliasToResume.push(oldComponentAlias)
            }
        }
        else {
            aliasToRemoveAfter.push(oldComponentAlias)
        }
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load()
    }
    // special
    oldComponentAlias && canvas.putOnPauseTicker(oldComponentAlias, { tickerIdsIncluded: ids })
    switch (direction) {
        case "up":
            component.y = canvas.canvasHeight + component.height
            break
        case "down":
            component.y = -(component.height)
            break
        case "left":
            component.x = canvas.canvasWidth + component.width
            break
        case "right":
            component.x = -(component.width)
            break
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    tickerAliasToResume.push(alias)
    let effect = new MoveTicker({
        ...props,
        tickerAliasToResume,
        aliasToRemoveAfter,
        destination,
        startOnlyIfHaveTexture: true,
    }, undefined, priority)
    let idShow = canvas.addTicker(alias, effect)
    if (idShow) {
        canvas.putOnPauseTicker(alias, { tickerIdsExcluded: [idShow] })
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow })
        res.push(idShow)
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res
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
    let { direction = "right", mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [] } = props
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter]
    }
    aliasToRemoveAfter.push(...alias)
    // get the destination
    let component = canvas.find(alias)
    if (!component) {
        console.warn("[Pixi’VN] The canvas component is not found.")
        return
    }
    let destination = { x: component.x, y: component.y }
    switch (direction) {
        case "up":
            destination.y = canvas.canvasHeight + component.height
            break
        case "down":
            destination.y = -(component.height)
            break
        case "left":
            destination.x = canvas.canvasWidth + component.width
            break
        case "right":
            destination.x = -(component.width)
            break
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let effect = new MoveTicker({
        ...props,
        destination,
        startOnlyIfHaveTexture: true,
        aliasToRemoveAfter,
    }, undefined, priority)
    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, { tickerIdsExcluded: [id] })
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: id })
        return [id]
    }
}

/**
 * Show a image in the canvas with a zoom effect. The image is zoomed in from the center of the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
 * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
 * If you don't provide the component, then the alias is used as the url.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function zoomIn(
    alias: string,
    component?: TComponent,
    props: ZoomInOutProps & {
        /**
         * If true, then the old component is removed with a zoom out, after the new image is zoomed in.
         * @default false
         */
        removeOldComponentWithZoomOut?: boolean
    } = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, tickerAliasToResume = [], aliasToRemoveAfter = [] } = props
    let res: string[] = []
    if (!component) {
        component = alias
    }
    if (typeof tickerAliasToResume === "string") {
        tickerAliasToResume = [tickerAliasToResume]
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter]
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined
    let oldCanvas = canvas.find(alias)
    if (oldCanvas) {
        oldComponentAlias = alias + "_temp_zoom"
        canvas.editAlias(alias, oldComponentAlias)
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component)
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias)
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "move")
    // edit the properties of the new component
    if (direction == "up") {
        component.pivot.y = canvas.canvasHeight - component.y
        component.pivot.x = (canvas.canvasWidth / 2) - component.x
        component.y = canvas.canvasHeight
        component.x = canvas.canvasWidth / 2
    }
    else if (direction == "down") {
        component.pivot.y = 0 - component.y
        component.pivot.x = (canvas.canvasWidth / 2) - component.x
        component.y = 0
        component.x = canvas.canvasWidth / 2
    }
    else if (direction == "left") {
        component.pivot.x = canvas.canvasWidth - component.x
        component.pivot.y = (canvas.canvasHeight / 2) - component.y
        component.x = canvas.canvasWidth
        component.y = canvas.canvasHeight / 2
    }
    else if (direction == "right") {
        component.pivot.x = 0 - component.x
        component.pivot.y = (canvas.canvasHeight / 2) - component.y
        component.x = 0
        component.y = canvas.canvasHeight / 2
    }
    component.pivot = getPivotBySuperPivot(component.pivot, component.angle)
    component.scale.set(0)
    let isZoomInOut = oldCanvas ? { pivot: { x: oldCanvas.pivot.x, y: oldCanvas.pivot.y }, position: { x: oldCanvas.x, y: oldCanvas.y } } : undefined
    // remove the old component
    if (oldComponentAlias) {
        if (props.removeOldComponentWithZoomOut) {
            let ids = zoomOut(oldComponentAlias, props, priority)
            if (ids) {
                res.push(...ids)
                tickerAliasToResume.push(oldComponentAlias)
            }
        }
        else {
            aliasToRemoveAfter.push(oldComponentAlias)
        }
        canvas.putOnPauseTicker(oldComponentAlias)
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    tickerAliasToResume.push(alias)
    let effect = new ZoomTicker({
        ...props,
        tickerAliasToResume,
        aliasToRemoveAfter,
        startOnlyIfHaveTexture: true,
        type: "zoom",
        limit: 1,
        isZoomInOut,
    }, undefined, priority)
    let idShow = canvas.addTicker(alias, effect)
    if (idShow) {
        canvas.putOnPauseTicker(alias, { tickerIdsExcluded: [idShow] })
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow })
        res.push(idShow)
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load()
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res
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
    props: ZoomInOutProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [] } = props
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter]
    }
    aliasToRemoveAfter.push(...alias)
    // get the destination
    let component = canvas.find(alias)
    if (!component) {
        console.warn("[Pixi’VN] The canvas component is not found.")
        return
    }
    if (direction == "up") {
        component.pivot.y = canvas.canvasHeight - component.y
        component.pivot.x = (canvas.canvasWidth / 2) - component.x
        component.y = canvas.canvasHeight
        component.x = (canvas.canvasWidth / 2)
    }
    else if (direction == "down") {
        component.pivot.y = 0 - component.y
        component.pivot.x = (canvas.canvasWidth / 2) - component.x
        component.y = 0
        component.x = (canvas.canvasWidth / 2)
    }
    else if (direction == "left") {
        component.pivot.x = canvas.canvasWidth - component.x
        component.pivot.y = (canvas.canvasHeight / 2) - component.y
        component.x = canvas.canvasWidth
        component.y = (canvas.canvasHeight / 2)
    }
    else if (direction == "right") {
        component.pivot.x = 0 - component.x
        component.pivot.y = (canvas.canvasHeight / 2) - component.y
        component.x = 0
        component.y = (canvas.canvasHeight / 2)
    }
    component.pivot = getPivotBySuperPivot(component.pivot, component.angle)
    component.scale.set(1)
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let effect = new ZoomTicker({
        ...props,
        startOnlyIfHaveTexture: true,
        type: "unzoom",
        limit: 0,
        aliasToRemoveAfter,
    }, undefined, priority)
    let id = canvas.addTicker(alias, effect)
    if (id) {
        canvas.putOnPauseTicker(alias, { tickerIdsExcluded: [id] })
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: id })
        return [id]
    }
}

/**
 * Show a image in the canvas with a push effect. The new image is pushed in from the inside of the canvas and the old image is pushed out to the outside of the canvas.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
 * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
 * If you don't provide the component, then the alias is used as the url.
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
 */
export async function pushIn(
    alias: string,
    component?: TComponent,
    props: PushInOutProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, tickerAliasToResume = [] } = props
    let res: string[] = []
    if (!component) {
        component = alias
    }
    if (typeof tickerAliasToResume === "string") {
        tickerAliasToResume = [tickerAliasToResume]
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_push"
        canvas.editAlias(alias, oldComponentAlias)
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component)
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias)
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "move")
    // edit the properties of the new component
    let destination: { x: number, y: number, type: "pixel" | "percentage" | "align" }
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        destination = component.positionInfo
    }
    else {
        destination = { x: component.x, y: component.y, type: "pixel" }
    }
    if (direction == "up") {
        component.y = -canvas.canvasHeight + component.y
    }
    else if (direction == "down") {
        component.y = canvas.canvasHeight + component.y
    }
    else if (direction == "left") {
        component.x = -canvas.canvasWidth + component.x
    }
    else if (direction == "right") {
        component.x = canvas.canvasWidth + component.x
    }
    // remove the old component
    if (oldComponentAlias) {
        let ids = pushOut(oldComponentAlias, props, priority)
        if (ids) {
            res.push(...ids)
        }
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    tickerAliasToResume.push(alias)
    let effect = new MoveTicker({
        ...props,
        tickerAliasToResume,
        startOnlyIfHaveTexture: true,
        destination,
    }, undefined, priority)
    let idShow = canvas.addTicker(alias, effect)
    if (idShow) {
        canvas.putOnPauseTicker(alias, { tickerIdsExcluded: [idShow] })
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow })
        res.push(idShow)
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load()
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res
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
    props: PushInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return moveOut(alias, props, priority)
}
