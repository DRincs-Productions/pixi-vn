import { Sprite as PixiSprite, UPDATE_PRIORITY } from "pixi.js";
import { canvas, CanvasBaseInterface, ImageContainerOptions, ImageSpriteOptions } from "..";
import { logger } from "../../utils/log-utility";
import ImageContainer from "../components/ImageContainer";
import ImageSprite from "../components/ImageSprite";
import VideoSprite from "../components/VideoSprite";
import {
    MoveInOutProps,
    PushInOutProps,
    ShowWithDissolveTransitionProps,
    ShowWithFadeTransitionProps,
    ZoomInOutProps,
} from "../interfaces/transition-props";
import {
    calculatePositionByAlign,
    calculatePositionByPercentagePosition,
    getPointBySuperPoint,
    getSuperHeight,
    getSuperPoint,
    getSuperWidth,
} from "./canvas-property-utility";
import { checkIfVideo } from "./canvas-utility";
import { addImageCointainer } from "./image-container-utility";
import { addImage } from "./image-utility";
import { addVideo } from "./video-utility";

function calculateDestination(
    destination: {
        type?: "pixel" | "percentage" | "align";
        y: number;
        x: number;
    },
    component: CanvasBaseInterface<any>
) {
    if (destination.type === "align") {
        let anchorx = undefined;
        let anchory = undefined;
        if (component instanceof PixiSprite) {
            anchorx = component.anchor.x;
            anchory = component.anchor.y;
        }
        let superPivot = getSuperPoint(component.pivot, component.angle);
        let superScale = getSuperPoint(component.scale, component.angle);
        destination.x = calculatePositionByAlign(
            "width",
            destination.x,
            getSuperWidth(component),
            superPivot.x,
            superScale.x < 0,
            anchorx
        );
        destination.y = calculatePositionByAlign(
            "height",
            destination.y,
            getSuperHeight(component),
            superPivot.y,
            superScale.y < 0,
            anchory
        );
    }
    if (destination.type === "percentage") {
        destination.x = calculatePositionByPercentagePosition("width", destination.x);
        destination.y = calculatePositionByPercentagePosition("height", destination.y);
    }
    return {
        x: destination.x,
        y: destination.y,
    };
}

type TComponent =
    | CanvasBaseInterface<any>
    | string
    | string[]
    | {
          value: string;
          options: ImageSpriteOptions;
      }
    | {
          value: string[];
          options: ImageContainerOptions;
      };
function addComponent(alias: string, canvasElement: TComponent): CanvasBaseInterface<any> {
    if (typeof canvasElement === "string") {
        if (checkIfVideo(canvasElement)) {
            return addVideo(alias, canvasElement);
        } else {
            return addImage(alias, canvasElement);
        }
    } else if (Array.isArray(canvasElement)) {
        return addImageCointainer(alias, canvasElement);
    } else if (typeof canvasElement === "object" && "value" in canvasElement && "options" in canvasElement) {
        if (typeof canvasElement.value === "string") {
            if (checkIfVideo(canvasElement.value)) {
                return addVideo(alias, canvasElement.value, canvasElement.options);
            } else {
                return addImage(alias, canvasElement.value, canvasElement.options);
            }
        } else if (Array.isArray(canvasElement.value)) {
            return addImageCointainer(alias, canvasElement.value, canvasElement.options as any);
        }
    }
    canvas.add(alias, canvasElement as CanvasBaseInterface<any>);
    return canvasElement as CanvasBaseInterface<any>;
}

/**
 * Show a image in the canvas with a disolve effect.
 * Disolve effect is a effect that the image is shown with a fade in.
 * If exist a image with the same alias, then the image is replaced and the first image is removed after the effect is done.
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
    priority?: UPDATE_PRIORITY
): Promise<string[] | undefined> {
    let { mustBeCompletedBeforeNextStep = true, tickerIdToResume = [], ...options } = props;
    let res: string[] = [];
    if (!component) {
        component = alias;
    }
    if (typeof tickerIdToResume === "string") {
        tickerIdToResume = [tickerIdToResume];
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined;
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_disolve";
        canvas.editAlias(alias, oldComponentAlias);
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component);
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "duplicate");
    // edit the properties of the new component
    component.alpha = 0;
    // remove the old component
    if (oldComponentAlias) {
        let ids = removeWithDissolve(oldComponentAlias, { ...props, autoplay: false }, priority);
        if (ids) {
            res.push(...ids);
            tickerIdToResume.push(...ids);
        }
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let idShow = canvas.animate(
        alias,
        {
            alpha: 1,
        },
        {
            ...options,
            tickerIdToResume,
        },
        priority
    );
    if (idShow) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow });
        res.push(idShow);
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load();
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res;
    }
}

/**
 * Remove a image from the canvas with a disolve effect.
 * Disolve effect is a effect that the image is removed with a fade out.
 * This function is equivalent to {@link removeWithFade}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function removeWithDissolve(
    alias: string,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY
): string[] | undefined {
    let { mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [], ...options } = props;
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter];
    }
    aliasToRemoveAfter.push(alias);
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let id = canvas.animate(
        alias,
        {
            alpha: 0,
        },
        {
            ...options,
            aliasToRemoveAfter,
        },
        priority
    );
    if (id) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: id });
        return [id];
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
    priority?: UPDATE_PRIORITY
): Promise<string[] | undefined> {
    let { mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [], ...options } = props;
    let res: string[] = [];
    if (!component) {
        component = alias;
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter];
    }
    // check if the alias is already exist
    if (!canvas.find(alias)) {
        return showWithDissolve(alias, component, props, priority);
    }
    let oldComponentAlias = alias + "_temp_fade";
    canvas.editAlias(alias, oldComponentAlias);
    aliasToRemoveAfter.push(oldComponentAlias);
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component);
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "duplicate");
    // edit the properties of the new component
    component.alpha = 0;
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let idShow = canvas.animate(
        alias,
        {
            alpha: 1,
        },
        {
            ...options,
            aliasToRemoveAfter,
        },
        priority
    );
    if (idShow) {
        // remove the old component
        let idHide = removeWithDissolve(
            oldComponentAlias,
            {
                ...props,
                tickerIdToResume: idShow,
            },
            priority
        );
        if (idHide) {
            res.push(...idHide);
        }

        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow });
        res.push(idShow);
        // pause the ticker
        canvas.pauseTicker({ id: idShow });
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load();
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res;
    }
}

/**
 * Remove a image from the canvas with a fade effect.
 * Fade effect is a effect that the image is removed with a fade out.
 * This function is equivalent to {@link removeWithDissolve}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param props The properties of the effect
 * @param priority The priority of the effect
 * @returns The ids of the tickers that are used in the effect.
 */
export function removeWithFade(
    alias: string,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY
): string[] | undefined {
    return removeWithDissolve(alias, props, priority);
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
        removeOldComponentWithMoveOut?: boolean;
    } = {},
    priority?: UPDATE_PRIORITY
): Promise<string[] | undefined> {
    let {
        direction = "right",
        mustBeCompletedBeforeNextStep = true,
        tickerIdToResume = [],
        aliasToRemoveAfter = [],
        removeOldComponentWithMoveOut,
        ...options
    } = props;
    let res: string[] = [];
    if (!component) {
        component = alias;
    }
    if (typeof tickerIdToResume === "string") {
        tickerIdToResume = [tickerIdToResume];
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter];
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined;
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_movein";
        canvas.editAlias(alias, oldComponentAlias);
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component);
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "move");
    // edit the properties of the new component
    let destination: { x: number; y: number; type: "pixel" | "percentage" | "align" };
    if (component instanceof ImageSprite || component instanceof ImageContainer) {
        destination = component.positionInfo;
    } else {
        destination = { x: component.x, y: component.y, type: "pixel" };
    }
    // remove the old component
    if (oldComponentAlias) {
        if (removeOldComponentWithMoveOut) {
            let ids = moveOut(oldComponentAlias, { ...props, autoplay: false }, priority);
            if (ids) {
                res.push(...ids);
                tickerIdToResume.push(...ids);
            }
        } else {
            aliasToRemoveAfter.push(oldComponentAlias);
        }
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load();
    }
    // special
    switch (direction) {
        case "up":
            component.y = canvas.canvasHeight + component.height;
            break;
        case "down":
            component.y = -component.height;
            break;
        case "left":
            component.x = canvas.canvasWidth + component.width;
            break;
        case "right":
            component.x = -component.width;
            break;
    }
    let ids = canvas.pauseTicker({ canvasAlias: alias });
    tickerIdToResume.push(...ids);
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let idShow = canvas.animate(
        alias,
        calculateDestination(destination, component),
        {
            ...options,
            tickerIdToResume,
            aliasToRemoveAfter,
        },
        priority
    );
    if (idShow) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow });
        res.push(idShow);
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res;
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
export function moveOut(alias: string, props: MoveInOutProps = {}, priority?: UPDATE_PRIORITY): string[] | undefined {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [], ...options } = props;
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter];
    }
    aliasToRemoveAfter.push(alias);
    // get the destination
    let component = canvas.find(alias);
    if (!component) {
        logger.warn(`The canvas component "${alias}" is not found.`);
        return;
    }
    let destination = { x: component.x, y: component.y };
    switch (direction) {
        case "up":
            destination.y = -component.height;
            break;
        case "down":
            destination.y = canvas.canvasHeight + component.height;
            break;
        case "left":
            destination.x = -component.width;
            break;
        case "right":
            destination.x = canvas.canvasWidth + component.width;
            break;
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    canvas.pauseTicker({ canvasAlias: alias });
    let id = canvas.animate(
        alias,
        destination,
        {
            ...options,
            aliasToRemoveAfter,
        },
        priority
    );
    if (id) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: id });
        return [id];
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
        removeOldComponentWithZoomOut?: boolean;
    } = {},
    priority?: UPDATE_PRIORITY
): Promise<string[] | undefined> {
    let {
        direction = "right",
        mustBeCompletedBeforeNextStep = true,
        tickerIdToResume = [],
        aliasToRemoveAfter = [],
        ...options
    } = props;
    let res: string[] = [];
    if (!component) {
        component = alias;
    }
    if (typeof tickerIdToResume === "string") {
        tickerIdToResume = [tickerIdToResume];
    }
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter];
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined;
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_zoom";
        canvas.editAlias(alias, oldComponentAlias);
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component);
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "move");
    // edit the properties of the new component
    let destination: { x: number; y: number; type: "pixel" | "percentage" | "align" };
    if (component instanceof ImageSprite || component instanceof ImageContainer) {
        destination = component.positionInfo;
    } else {
        destination = { x: component.x, y: component.y, type: "pixel" };
    }
    const pivot: { x: number; y: number } = {
        x: component.pivot.x,
        y: component.pivot.y,
    };
    const scale: { x: number; y: number } = {
        x: component.scale.x,
        y: component.scale.y,
    };
    // remove the old component
    if (oldComponentAlias) {
        if (props.removeOldComponentWithZoomOut) {
            let ids = zoomOut(oldComponentAlias, { ...props, autoplay: false }, priority);
            if (ids) {
                res.push(...ids);
                tickerIdToResume.push(...ids);
            }
        } else {
            aliasToRemoveAfter.push(oldComponentAlias);
        }
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load();
    }
    // edit the properties of the new component
    if (direction == "up") {
        component.pivot.y = canvas.canvasHeight - component.y;
        component.pivot.x = canvas.canvasWidth / 2 - component.x;
        component.y = canvas.canvasHeight;
        component.x = canvas.canvasWidth / 2;
    } else if (direction == "down") {
        component.pivot.y = 0 - component.y;
        component.pivot.x = canvas.canvasWidth / 2 - component.x;
        component.y = 0;
        component.x = canvas.canvasWidth / 2;
    } else if (direction == "left") {
        component.pivot.x = canvas.canvasWidth - component.x;
        component.pivot.y = canvas.canvasHeight / 2 - component.y;
        component.x = canvas.canvasWidth;
        component.y = canvas.canvasHeight / 2;
    } else if (direction == "right") {
        component.pivot.x = 0 - component.x;
        component.pivot.y = canvas.canvasHeight / 2 - component.y;
        component.x = 0;
        component.y = canvas.canvasHeight / 2;
    }
    component.pivot = getPointBySuperPoint(component.pivot, component.angle);
    component.scale.set(0);
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let ids = canvas.pauseTicker({ canvasAlias: alias });
    tickerIdToResume.push(...ids);
    let idShow = canvas.animate(
        alias,
        {
            ...calculateDestination(destination, component),
            pivotX: pivot.x,
            pivotY: pivot.y,
            scaleX: scale.x,
            scaleY: scale.y,
        },
        {
            ...options,
            tickerIdToResume,
            aliasToRemoveAfter,
        },
        priority
    );
    if (idShow) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow });
        res.push(idShow);
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res;
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
export function zoomOut(alias: string, props: ZoomInOutProps = {}, priority?: UPDATE_PRIORITY): string[] | undefined {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, aliasToRemoveAfter = [], ...options } = props;
    if (typeof aliasToRemoveAfter === "string") {
        aliasToRemoveAfter = [aliasToRemoveAfter];
    }
    aliasToRemoveAfter.push(alias);
    // get the destination
    let component = canvas.find(alias);
    if (!component) {
        logger.warn(`The canvas component "${alias}" is not found.`);
        return;
    }
    let destination = { x: component.x, y: component.y };
    let pivot: { x: number; y: number } = {
        x: component.pivot.x,
        y: component.pivot.y,
    };
    if (direction == "down") {
        destination.y = canvas.canvasHeight;
        destination.x = canvas.canvasWidth / 2;
        pivot.y = canvas.canvasHeight - destination.y;
        pivot.x = canvas.canvasWidth / 2 - destination.x;
    } else if (direction == "up") {
        destination.y = 0;
        destination.x = canvas.canvasWidth / 2;
        pivot.y = 0 - destination.y;
        pivot.x = canvas.canvasWidth / 2 - destination.x;
    } else if (direction == "right") {
        destination.x = canvas.canvasWidth;
        destination.y = canvas.canvasHeight / 2;
        pivot.x = canvas.canvasWidth - destination.x;
        pivot.y = canvas.canvasHeight / 2 - destination.y;
    } else if (direction == "left") {
        destination.x = 0;
        destination.y = canvas.canvasHeight / 2;
        pivot.x = 0 - destination.x;
        pivot.y = canvas.canvasHeight / 2 - destination.y;
    }
    pivot = getPointBySuperPoint(pivot, component.angle);
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    canvas.pauseTicker({ canvasAlias: alias });
    let id = canvas.animate(
        alias,
        {
            ...destination,
            pivotX: pivot.x,
            pivotY: pivot.y,
            scaleX: 0,
            scaleY: 0,
        },
        {
            ...options,
            aliasToRemoveAfter,
        },
        priority
    );
    if (id) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: id });
        return [id];
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
    priority?: UPDATE_PRIORITY
): Promise<string[] | undefined> {
    let { direction = "right", mustBeCompletedBeforeNextStep = true, tickerIdToResume = [], ...options } = props;
    let res: string[] = [];
    if (!component) {
        component = alias;
    }
    if (typeof tickerIdToResume === "string") {
        tickerIdToResume = [tickerIdToResume];
    }
    // check if the alias is already exist
    let oldComponentAlias: string | undefined = undefined;
    if (canvas.find(alias)) {
        oldComponentAlias = alias + "_temp_push";
        canvas.editAlias(alias, oldComponentAlias);
    }
    // add the new component and transfer the properties of the old component to the new component
    component = addComponent(alias, component);
    oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
    oldComponentAlias && canvas.transferTickers(oldComponentAlias, alias, "move");
    // edit the properties of the new component
    let destination: { x: number; y: number; type: "pixel" | "percentage" | "align" };
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        destination = component.positionInfo;
    } else {
        destination = { x: component.x, y: component.y, type: "pixel" };
    }
    switch (direction) {
        case "up":
            component.y = canvas.canvasHeight + component.height;
            break;
        case "down":
            component.y = -component.height;
            break;
        case "left":
            component.x = canvas.canvasWidth + component.width;
            break;
        case "right":
            component.x = -component.width;
            break;
    }
    let ids = canvas.pauseTicker({ canvasAlias: alias });
    tickerIdToResume.push(...ids);
    // remove the old component
    if (oldComponentAlias) {
        let ids = pushOut(oldComponentAlias, {
            ...props,
            direction: direction, //== "up" ? "down" : direction == "down" ? "up" : direction == "left" ? "right" : "left",
        });
        if (ids) {
            res.push(...ids);
        }
    }
    // create the ticker, play it and add it to mustBeCompletedBeforeNextStep
    let idShow = canvas.animate(
        alias,
        calculateDestination(destination, component),
        {
            ...options,
            tickerIdToResume,
        },
        priority
    );
    if (idShow) {
        mustBeCompletedBeforeNextStep && canvas.completeTickerOnStepEnd({ id: idShow });
        res.push(idShow);
    }
    // load the image if the image is not loaded
    if ((component instanceof ImageSprite || component instanceof ImageContainer) && component.haveEmptyTexture) {
        await component.load();
    }
    // return the ids of the tickers
    if (res.length > 0) {
        return res;
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
    priority?: UPDATE_PRIORITY
): string[] | undefined {
    return moveOut(alias, props, priority);
}
