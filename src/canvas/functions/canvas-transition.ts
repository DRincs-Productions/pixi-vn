import PixiContainer from "@canvas/components/Container";
import {
    createFilterTransitionApplier,
    snapshotLocalBounds,
    type FilterTransitionConfig,
    type IrisFilterConfig,
    type SplitFilterConfig,
    type WipeFilterConfig,
} from "@canvas/functions/canvas-filter-transition-utility";
import {
    buildGlitchJitter,
    circleOverhang,
    shockwaveTravel,
    zoomBlurPadding,
} from "@canvas/functions/filter-effect-utility";
import { addMotionFilterEffect, componentFilterCenter } from "@canvas/functions/filter-utility";
import type { ColorType } from "@canvas/types/ColorType";
import { filters } from "@drincs/pixi-vn/filters";
import type { AnimationOptions } from "@drincs/pixi-vn/motion";
import type {
    Filter,
    Container as PixiJsContainer,
    PointData,
    UPDATE_PRIORITY,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { tickers } from "@drincs/pixi-vn/tickers";
import { logger } from "@utils/log-utility";
import {
    canvas,
    type CanvasBaseInterface,
    type ImageContainerOptions,
    type ImageSpriteOptions,
} from "..";
import ImageContainer from "../components/ImageContainer";
import ImageSprite from "../components/ImageSprite";
import VideoSprite from "../components/VideoSprite";
import { CanvasPropertyUtility as PropsUtils } from "../functions/canvas-property-utility";
import type {
    BlurInOutProps,
    FilterFadeTransitionProps,
    FlashInOutProps,
    GlitchInOutProps,
    IrisInOutProps,
    MoveInOutProps,
    NoiseDissolveInOutProps,
    PinchInOutProps,
    PixelateInOutProps,
    PushInOutProps,
    RippleInOutProps,
    ShowWithDissolveTransitionProps,
    ShowWithFadeTransitionProps,
    SplitInOutProps,
    TvInOutProps,
    TwistInOutProps,
    WarpInOutProps,
    WipeInOutProps,
    ZoomInOutProps,
} from "../interfaces/transition-props";
import { checkIfVideo } from "./canvas-utility";
import { addImageCointainer } from "./image-container-utility";
import { addImage } from "./image-utility";
import { addVideo } from "./video-utility";

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

/**
 * @deprecated Use `transitions.showWithDissolve` instead.
 */
export async function showWithDissolve(
    alias: string,
    component?: TComponent,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    return transitions.showWithDissolve(alias, component, props, priority);
}

/**
 * @deprecated Use `transitions.removeWithDissolve` instead.
 */
export function removeWithDissolve(
    alias: string,
    props: ShowWithDissolveTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return transitions.removeWithDissolve(alias, props, priority);
}

/**
 * @deprecated Use `transitions.showWithFade` instead.
 */
export async function showWithFade(
    alias: string,
    component?: TComponent,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    return transitions.showWithFade(alias, component, props, priority);
}

/**
 * @deprecated Use `transitions.removeWithFade` instead.
 */
export function removeWithFade(
    alias: string,
    props: ShowWithFadeTransitionProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return transitions.removeWithFade(alias, props, priority);
}

/**
 * @deprecated Use `transitions.moveIn` instead.
 */
export async function moveIn(
    alias: string,
    component?: TComponent,
    props: MoveInOutProps & {
        /**
         * @deprecated Use `animateOldComponentOut` instead.
         */
        removeOldComponentWithMoveOut?: boolean;
    } = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    return transitions.moveIn(alias, component, props, priority);
}

/**
 * @deprecated Use `transitions.moveOut` instead.
 */
export function moveOut(
    alias: string,
    props: MoveInOutProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return transitions.moveOut(alias, props, priority);
}

/**
 * @deprecated Use `transitions.zoomIn` instead.
 */
export async function zoomIn(
    alias: string,
    component?: TComponent,
    props: ZoomInOutProps & {
        /**
         * @deprecated Use `animateOldComponentOut` instead.
         */
        removeOldComponentWithZoomOut?: boolean;
    } = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    return transitions.zoomIn(alias, component, props, priority);
}

/**
 * @deprecated Use `transitions.zoomOut` instead.
 */
export function zoomOut(
    alias: string,
    props: ZoomInOutProps = {},
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return transitions.zoomOut(alias, props, priority);
}

/**
 * @deprecated Use `transitions.pushIn` instead.
 */
export async function pushIn(
    alias: string,
    component?: TComponent,
    props: PushInOutProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    return transitions.pushIn(alias, component, props, priority);
}

/**
 * @deprecated Use `transitions.pushOut` instead.
 */
export function pushOut(
    alias: string,
    props: PushInOutProps = { direction: "right" },
    priority?: UPDATE_PRIORITY,
): string[] | undefined {
    return transitions.pushOut(alias, props, priority);
}

export namespace transitions {
    function mapDestination(destination: {
        type?: "pixel" | "percentage" | "align";
        y: number;
        x: number;
    }): Partial<ImageSpriteOptions> {
        switch (destination.type) {
            case "align":
                return {
                    xAlign: destination.x,
                    yAlign: destination.y,
                };
            case "percentage":
                return {
                    percentageX: destination.x,
                    percentageY: destination.y,
                };
            default:
                return {
                    x: destination.x,
                    y: destination.y,
                };
        }
    }

    function addComponent(
        alias: string,
        canvasElement: TComponent,
        options: {
            zIndex?: number;
            properties?: Partial<ImageSpriteOptions & ImageContainerOptions>;
        },
    ): CanvasBaseInterface<any> {
        if (typeof canvasElement === "string") {
            if (checkIfVideo(canvasElement)) {
                return addVideo(alias, canvasElement, {
                    ...options.properties,
                    zIndex: options.zIndex,
                });
            } else {
                return addImage(alias, canvasElement, {
                    ...options.properties,
                    zIndex: options.zIndex,
                });
            }
        } else if (Array.isArray(canvasElement)) {
            return addImageCointainer(alias, canvasElement, {
                ...options.properties,
                zIndex: options.zIndex,
            } as any);
        } else if (
            typeof canvasElement === "object" &&
            "value" in canvasElement &&
            "options" in canvasElement
        ) {
            if (typeof canvasElement.value === "string") {
                if (checkIfVideo(canvasElement.value)) {
                    return addVideo(alias, canvasElement.value, {
                        ...canvasElement.options,
                        ...options.properties,
                        zIndex: options.zIndex,
                    });
                } else {
                    return addImage(alias, canvasElement.value, {
                        ...canvasElement.options,
                        ...options.properties,
                        zIndex: options.zIndex,
                    });
                }
            } else if (Array.isArray(canvasElement.value)) {
                return addImageCointainer(alias, canvasElement.value, {
                    ...canvasElement.options,
                    ...options.properties,
                    zIndex: options.zIndex,
                } as any);
            }
        }
        canvas.add(alias, canvasElement as CanvasBaseInterface<any>, options);
        return canvasElement as CanvasBaseInterface<any>;
    }

    function getInitialComponentProperties(
        component: CanvasBaseInterface<any>,
    ): Partial<ImageSpriteOptions & ImageContainerOptions> {
        const visualComponent = component as unknown as Partial<ImageSpriteOptions>;
        return {
            x: visualComponent.x,
            y: visualComponent.y,
            anchor: visualComponent.anchor,
            scale: visualComponent.scale,
            pivot: visualComponent.pivot,
            skew: visualComponent.skew,
            rotation: visualComponent.rotation,
            angle: visualComponent.angle,
        };
    }

    /**
     * Shared swap logic for the mask/filter-based transitions below (wipe/iris/split/blur/pixelate):
     * replaces whatever is under `alias` with `component`, transferring the old element's tickers and
     * properties the same way {@link moveIn}/{@link zoomIn} do, but without any position/scale change.
     */
    function swapComponentForEffect(
        alias: string,
        component: TComponent,
        tag: string,
    ): { component: CanvasBaseInterface<any>; oldComponentAlias?: string } {
        let oldComponentAlias: string | undefined;
        const oldComponent = canvas.find(alias);
        if (oldComponent) {
            oldComponentAlias = `${alias}_temp_${tag}`;
            canvas.editAlias(alias, oldComponentAlias);
        }
        const newComponent = addComponent(alias, component, {
            zIndex: oldComponent ? oldComponent.parent?.getChildIndex(oldComponent) : undefined,
            properties: oldComponent ? getInitialComponentProperties(oldComponent) : undefined,
        });
        oldComponent?.parent?.setChildIndex(
            oldComponent,
            oldComponent.parent.getChildIndex(oldComponent) - 0.1,
        );
        oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
        oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "duplicate");
        return { component: newComponent, oldComponentAlias };
    }

    /**
     * Handles the component replaced by an `xIn` transition: with `animate` it leaves through `playOut`
     * (the matching `xOut`, started together with the in animation), otherwise it stays untouched under
     * the new component and is removed via `aliasToRemoveAfter` once the in animation is done.
     * @returns The ids of the out ticker(s) started, if any.
     */
    function handleOldComponent(
        oldComponentAlias: string | undefined,
        animate: boolean,
        aliasToRemoveAfter: string[],
        playOut: (oldComponentAlias: string) => string[] | undefined,
    ): string[] {
        if (!oldComponentAlias) {
            return [];
        }
        if (!animate) {
            aliasToRemoveAfter.push(oldComponentAlias);
            return [];
        }
        return playOut(oldComponentAlias) ?? [];
    }

    /** The props of an `xIn` call that also apply to the `xOut` of the component it replaces. */
    function oldComponentOutProps<
        T extends { aliasToRemoveAfter?: unknown; animateOldComponentOut?: boolean },
    >(props: T): Omit<T, "aliasToRemoveAfter" | "animateOldComponentOut"> {
        const { aliasToRemoveAfter, animateOldComponentOut, ...rest } = props;
        return rest;
    }

    function withIds(id: string | undefined, extra: string[]): string[] | undefined {
        const ids = id ? [id, ...extra] : extra;
        return ids.length > 0 ? ids : undefined;
    }

    /**
     * Maps the `direction` shorthand shared by {@link WipeInOutProps} to the generic `angle` it's
     * equivalent to.
     */
    function directionToAngle(direction: "up" | "down" | "left" | "right"): number {
        switch (direction) {
            case "up":
                return 90;
            case "down":
                return 270;
            case "left":
                return 180;
            default:
                return 0;
        }
    }

    /**
     * Creates and starts a `filters.animate`-driven progress animation for `alias` (no `filter` - a
     * plain value forwarded through `apply`), wiring up `completeOnContinue` the same way
     * {@link addMotionFilterEffect} does. This is the single place every mask-based transition
     * (wipe/iris/split) goes through - `blurIn`/`blurOut`/`pixelateIn`/`pixelateOut` use
     * {@link addMotionFilterEffect} instead, since they animate a `Filter`'s own properties rather than
     * mask geometry.
     */
    function addMotionValueEffect(
        alias: string,
        args: {
            config: FilterTransitionConfig;
            from: number;
            to: number;
            duration?: number;
            delay?: number | ((index: number, total: number) => number);
            ease?: unknown;
            completeOnContinue?: boolean;
            aliasToRemoveAfter?: string[];
            tickerIdToResume?: string[];
        },
        priority?: UPDATE_PRIORITY,
    ): string | undefined {
        // The `apply`/`cleanup` callbacks are rebuilt from `valueRef` whenever the ticker is
        // reconstructed (save restore, step back), so the animation survives it.
        const { apply, cleanup } = createFilterTransitionApplier(alias, args.config);
        const id = filters.animate(
            alias,
            undefined,
            { value: [args.from, args.to] },
            {
                duration: args.duration ?? 1,
                delay: args.delay,
                ease: args.ease as AnimationOptions["ease"],
                aliasToRemoveAfter: args.aliasToRemoveAfter,
                tickerIdToResume: args.tickerIdToResume,
            },
            priority,
            apply,
            cleanup,
            { alias, config: args.config },
        );
        if (id) {
            // Applies `from` immediately, the same frame the component is first rendered, so the
            // component never renders unmasked before the ticker's first real tick.
            apply(args.from);
        }
        if (id && (args.completeOnContinue ?? true)) {
            tickers.completeOnStepEnd({ id });
        }
        return id;
    }

    /**
     * Optionally softens what would otherwise be an instant pop-in/pop-out by fading `component`'s own
     * alpha, at a quarter of `mainDuration`, mirrored to the start (`"in"`) or end (`"out"`) of the main
     * effect - used by `blurIn`/`blurOut`, `flashIn` (fresh element only, see {@link flashReplace} for
     * the "replace" case, which never needs this)/`flashOut`, and `pixelateIn`/`pixelateOut` when their
     * `fadeComponent` prop is true.
     *
     * A separate, short-lived `canvas.animate` call rather than folding into the main effect's own
     * ticker: the two animate different objects (the component vs. the filter/overlay) with different
     * keyframe curves, and `motion`'s own sequence support only stages multiple keyframe segments
     * against a single shared target, not different targets within one ticker.
     */
    function fadeComponentAlongsideEffect(
        alias: string,
        component: CanvasBaseInterface<any> | undefined,
        phase: "in" | "out",
        mainDuration: number,
        priority?: UPDATE_PRIORITY,
    ): void {
        const fadeDuration = Math.max(mainDuration, 0) / 4;
        if (phase === "in") {
            if (component) {
                component.alpha = 0;
            }
            canvas.animate(
                alias,
                { alpha: [0, 1] },
                { duration: fadeDuration, completeOnContinue: false },
                priority,
            );
        } else {
            canvas.animate(
                alias,
                { alpha: [1, 0] },
                {
                    duration: fadeDuration,
                    delay: Math.max(mainDuration - fadeDuration, 0),
                    completeOnContinue: false,
                },
                priority,
            );
        }
    }

    /**
     * Builds the `alpha` keyframes/`times` pair for {@link flashIn}/{@link flashOut}/{@link flashReplace}'s
     * color overlay: `pulses` repetitions of fade-in (`fadeDuration`) -> hold (`holdDuration`) ->
     * fade-out (`fadeDuration`), using the same multi-stop keyframe-array idiom {@link effects.shakeEffect}
     * uses. When `endAtPeak` is true, the very last pulse skips its fade-out, leaving the overlay held at
     * `maxAlpha` when the animation completes - used by {@link flashReplace}'s "fade the old content up"
     * half, so the content swap happens while the screen is a solid `color`. `flashOut` always runs the
     * full cycle (fade up -> hold -> fade back down to normal) and only removes the element once that's
     * done - the removal itself is a hard cut, not an additional dissolve.
     */
    function buildFlashKeyframes(
        maxAlpha: number,
        fadeDuration: number,
        holdDuration: number,
        pulses: number,
        endAtPeak: boolean = false,
    ): { values: number[]; times: number[]; total: number } {
        const cycles = Math.max(pulses, 1);
        const perCycle = fadeDuration * 2 + holdDuration;
        const lastCycle = endAtPeak ? fadeDuration + holdDuration : perCycle;
        const total = Math.max(perCycle * (cycles - 1) + lastCycle, 0.001);
        const values: number[] = [0];
        const times: number[] = [0];
        let t = 0;
        for (let i = 0; i < cycles; i++) {
            const isLastCycle = i === cycles - 1;
            t += fadeDuration;
            values.push(maxAlpha);
            times.push(t / total);
            t += holdDuration;
            values.push(maxAlpha);
            times.push(t / total);
            if (!isLastCycle || !endAtPeak) {
                t += fadeDuration;
                values.push(0);
                times.push(Math.min(t / total, 1));
            }
        }
        return { values, times, total };
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
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        let { completeOnContinue = true, tickerIdToResume = [], ...options } = props;
        const res: string[] = [];
        if (!component) {
            component = alias;
        }
        if (typeof tickerIdToResume === "string") {
            tickerIdToResume = [tickerIdToResume];
        }
        // check if the alias is already exist
        let oldComponentAlias: string | undefined;
        const oldComponent = canvas.find(alias);
        if (oldComponent) {
            oldComponentAlias = `${alias}_temp_disolve`;
            canvas.editAlias(alias, oldComponentAlias);
        }
        // add the new component and transfer the properties of the old component to the new component
        component = addComponent(alias, component, {
            zIndex: oldComponent ? oldComponent.parent?.getChildIndex(oldComponent) : undefined,
            properties: oldComponent ? getInitialComponentProperties(oldComponent) : undefined,
        });
        oldComponent?.parent?.setChildIndex(
            oldComponent,
            oldComponent.parent.getChildIndex(oldComponent) - 0.1,
        );
        oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
        oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "duplicate");
        // edit the properties of the new component
        component.alpha = 0;
        // remove the old component
        if (oldComponentAlias) {
            const ids = removeWithDissolve(
                oldComponentAlias,
                { ...props, autoplay: false, completeOnContinue },
                priority,
            );
            if (ids) {
                res.push(...ids);
                tickerIdToResume.push(...ids);
            }
        }
        // create the ticker and play it
        const idShow = canvas.animate(
            alias,
            {
                alpha: 1,
            },
            {
                ...options,
                tickerIdToResume,
                completeOnContinue,
            },
            priority,
        );
        idShow && res.push(idShow);
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
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        let { completeOnContinue = true, aliasToRemoveAfter = [], ...options } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        // create the ticker and play it
        const id = canvas.animate(
            alias,
            {
                alpha: 0,
            },
            {
                ...options,
                aliasToRemoveAfter,
                completeOnContinue,
            },
            priority,
        );
        if (id) {
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
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        let { completeOnContinue = true, aliasToRemoveAfter = [], ...options } = props;
        const res: string[] = [];
        if (!component) {
            component = alias;
        }
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        // check if the alias is already exist
        const oldComponent = canvas.find(alias);
        if (!oldComponent) {
            return showWithDissolve(alias, component, props, priority);
        }
        const oldComponentAlias = `${alias}_temp_fade`;
        canvas.editAlias(alias, oldComponentAlias);
        aliasToRemoveAfter.push(oldComponentAlias);
        // add the new component and transfer the properties of the old component to the new component
        component = addComponent(alias, component, {
            zIndex: oldComponent ? oldComponent.parent?.getChildIndex(oldComponent) : undefined,
            properties: getInitialComponentProperties(oldComponent),
        });
        oldComponent?.parent?.setChildIndex(
            oldComponent,
            oldComponent.parent.getChildIndex(oldComponent) - 0.1,
        );
        oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
        oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "duplicate");
        // edit the properties of the new component
        component.alpha = 0;
        // create the ticker and play it
        const idShow = canvas.animate(
            alias,
            {
                alpha: 1,
            },
            {
                ...options,
                aliasToRemoveAfter,
                completeOnContinue,
            },
            priority,
        );
        if (idShow) {
            // remove the old component
            const idHide = removeWithDissolve(
                oldComponentAlias,
                {
                    ...props,
                    tickerIdToResume: idShow,
                    completeOnContinue,
                },
                priority,
            );
            if (idHide) {
                res.push(...idHide);
            }

            res.push(idShow);
            // pause the ticker
            tickers.pause({ id: idShow });
        }
        // load the image if the image is not loaded
        if (
            (component instanceof ImageSprite || component instanceof ImageContainer) &&
            component.haveEmptyTexture
        ) {
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
        priority?: UPDATE_PRIORITY,
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
             * @deprecated Use `animateOldComponentOut` instead.
             */
            removeOldComponentWithMoveOut?: boolean;
        } = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        let {
            direction = "right",
            completeOnContinue = true,
            tickerIdToResume = [],
            aliasToRemoveAfter = [],
            removeOldComponentWithMoveOut,
            animateOldComponentOut = removeOldComponentWithMoveOut ?? false,
            motionBlur,
            ...options
        } = props;
        const res: string[] = [];
        let destination:
            | undefined
            | { x: number; y: number; type: "pixel" | "percentage" | "align" };
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
        let oldComponentAlias: string | undefined;
        const oldComponent = canvas.find(alias);
        if (oldComponent) {
            oldComponentAlias = `${alias}_temp_movein`;
            canvas.editAlias(alias, oldComponentAlias);
            if (oldComponent instanceof ImageSprite || oldComponent instanceof ImageContainer) {
                destination = oldComponent.positionInfo;
            } else {
                destination = { x: oldComponent.x, y: oldComponent.y, type: "pixel" };
            }
        }
        // add the new component and transfer the properties of the old component to the new component
        component = addComponent(alias, component, {
            zIndex: oldComponent ? oldComponent.parent?.getChildIndex(oldComponent) : undefined,
        });
        oldComponent?.parent?.setChildIndex(
            oldComponent,
            oldComponent.parent.getChildIndex(oldComponent) - 0.1,
        );
        oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
        oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "move");
        if (
            (component instanceof ImageSprite || component instanceof ImageContainer) &&
            component.haveEmptyTexture
        ) {
            await component.load();
        }
        // edit the properties of the new component
        if (!destination) {
            if (component instanceof ImageSprite || component instanceof ImageContainer) {
                destination = component.positionInfo;
            } else {
                destination = { x: component.x, y: component.y, type: "pixel" };
            }
        }
        // remove the old component
        if (oldComponentAlias) {
            if (animateOldComponentOut) {
                const ids = moveOut(
                    oldComponentAlias,
                    { ...options, direction, motionBlur, autoplay: false, completeOnContinue },
                    priority,
                );
                if (ids) {
                    res.push(...ids);
                    tickerIdToResume.push(...ids);
                }
            } else {
                aliasToRemoveAfter.push(oldComponentAlias);
            }
        }
        // edit the properties of the new component
        switch (direction) {
            case "up":
                component.y = canvas.height + component.height;
                break;
            case "down":
                component.y = -component.height;
                break;
            case "left":
                component.x = canvas.width + component.width;
                break;
            case "right":
                component.x = -component.width;
                break;
        }
        const ids = tickers.pause({ canvasAlias: alias });
        tickerIdToResume.push(...ids);
        // create the ticker and play it
        const idShow = canvas.animate(
            alias,
            mapDestination(destination) as any,
            {
                ...options,
                tickerIdToResume,
                aliasToRemoveAfter,
                completeOnContinue,
            },
            priority,
        );
        idShow && res.push(idShow);
        const idBlur = addMoveMotionBlur(
            alias,
            component,
            direction,
            motionBlur,
            { ...options, completeOnContinue },
            priority,
        );
        idBlur && res.push(idBlur);
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
    export function moveOut(
        alias: string,
        props: MoveInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        let {
            direction = "right",
            completeOnContinue = true,
            aliasToRemoveAfter = [],
            motionBlur,
            ...options
        } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        // get the destination
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const destination = { x: component.x, y: component.y };
        switch (direction) {
            case "up":
                destination.y = -component.height;
                break;
            case "down":
                destination.y = canvas.height + component.height;
                break;
            case "left":
                destination.x = -component.width;
                break;
            case "right":
                destination.x = canvas.width + component.width;
                break;
        }
        // create the ticker and play it
        tickers.pause({ canvasAlias: alias });
        const id = canvas.animate(
            alias,
            destination,
            {
                ...options,
                aliasToRemoveAfter,
                completeOnContinue,
            },
            priority,
        );
        const idBlur = addMoveMotionBlur(
            alias,
            component,
            direction,
            motionBlur,
            { ...options, completeOnContinue },
            priority,
        );
        return collectTickerIds([id, idBlur]);
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
             * @deprecated Use `animateOldComponentOut` instead.
             */
            removeOldComponentWithZoomOut?: boolean;
        } = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        let {
            direction = "right",
            completeOnContinue = true,
            tickerIdToResume = [],
            aliasToRemoveAfter = [],
            removeOldComponentWithZoomOut,
            animateOldComponentOut = removeOldComponentWithZoomOut ?? false,
            ...options
        } = props;
        const res: string[] = [];
        let destination:
            | undefined
            | { x: number; y: number; type: "pixel" | "percentage" | "align" };
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
        let oldComponentAlias: string | undefined;
        const oldComponent = canvas.find(alias);
        if (oldComponent) {
            oldComponentAlias = `${alias}_temp_zoom`;
            canvas.editAlias(alias, oldComponentAlias);
            if (oldComponent instanceof ImageSprite || oldComponent instanceof ImageContainer) {
                destination = oldComponent.positionInfo;
            } else {
                destination = { x: oldComponent.x, y: oldComponent.y, type: "pixel" };
            }
        }
        // add the new component and transfer the properties of the old component to the new component
        component = addComponent(alias, component, {
            zIndex: oldComponent ? oldComponent.parent?.getChildIndex(oldComponent) : undefined,
        });
        oldComponent?.parent?.setChildIndex(
            oldComponent,
            oldComponent.parent.getChildIndex(oldComponent) - 0.1,
        );
        oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
        oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "move");
        // load the image before reading its size: the destination/pivot depend on it
        if (
            (component instanceof ImageSprite || component instanceof ImageContainer) &&
            component.haveEmptyTexture
        ) {
            await component.load();
        }
        // edit the properties of the new component
        if (!destination) {
            if (component instanceof ImageSprite || component instanceof ImageContainer) {
                destination = component.positionInfo;
            } else {
                destination = { x: component.x, y: component.y, type: "pixel" };
            }
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
            if (animateOldComponentOut) {
                const ids = zoomOut(
                    oldComponentAlias,
                    { ...options, direction, autoplay: false, completeOnContinue },
                    priority,
                );
                if (ids) {
                    res.push(...ids);
                    tickerIdToResume.push(...ids);
                }
            } else {
                aliasToRemoveAfter.push(oldComponentAlias);
            }
        }
        // load the image if the image is not loaded
        if (
            (component instanceof ImageSprite || component instanceof ImageContainer) &&
            component.haveEmptyTexture
        ) {
            await component.load();
        }
        // edit the properties of the new component
        if (direction === "up") {
            component.pivot.y = canvas.height - component.y;
            component.pivot.x = canvas.width / 2 - component.x;
            component.y = canvas.height;
            component.x = canvas.width / 2;
        } else if (direction === "down") {
            component.pivot.y = 0 - component.y;
            component.pivot.x = canvas.width / 2 - component.x;
            component.y = 0;
            component.x = canvas.width / 2;
        } else if (direction === "left") {
            component.pivot.x = canvas.width - component.x;
            component.pivot.y = canvas.height / 2 - component.y;
            component.x = canvas.width;
            component.y = canvas.height / 2;
        } else if (direction === "right") {
            component.pivot.x = 0 - component.x;
            component.pivot.y = canvas.height / 2 - component.y;
            component.x = 0;
            component.y = canvas.height / 2;
        }
        component.pivot = PropsUtils.getPointBySuperPoint(component.pivot, component.angle);
        component.scale.set(0);
        // pause the ticker
        const ids = tickers.pause({ canvasAlias: alias });
        tickerIdToResume.push(...ids);
        // create the ticker and play it
        const idShow = canvas.animate(
            alias,
            {
                pivotX: pivot.x,
                pivotY: pivot.y,
                scaleX: scale.x,
                scaleY: scale.y,
                ...(mapDestination(destination) as any),
            },
            {
                ...options,
                tickerIdToResume,
                aliasToRemoveAfter,
                completeOnContinue,
            },
            priority,
        );
        idShow && res.push(idShow);
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
    export function zoomOut(
        alias: string,
        props: ZoomInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        let {
            direction = "right",
            completeOnContinue = true,
            aliasToRemoveAfter = [],
            ...options
        } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        // get the destination
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const destination = { x: component.x, y: component.y };
        let pivot: { x: number; y: number } = {
            x: component.pivot.x,
            y: component.pivot.y,
        };
        if (direction === "down") {
            destination.y = canvas.height;
            destination.x = canvas.width / 2;
            pivot.y = canvas.height - destination.y;
            pivot.x = canvas.width / 2 - destination.x;
        } else if (direction === "up") {
            destination.y = 0;
            destination.x = canvas.width / 2;
            pivot.y = 0 - destination.y;
            pivot.x = canvas.width / 2 - destination.x;
        } else if (direction === "right") {
            destination.x = canvas.width;
            destination.y = canvas.height / 2;
            pivot.x = canvas.width - destination.x;
            pivot.y = canvas.height / 2 - destination.y;
        } else if (direction === "left") {
            destination.x = 0;
            destination.y = canvas.height / 2;
            pivot.x = 0 - destination.x;
            pivot.y = canvas.height / 2 - destination.y;
        }
        pivot = PropsUtils.getPointBySuperPoint(pivot, component.angle);
        // create the ticker and play it
        tickers.pause({ canvasAlias: alias });
        const id = canvas.animate(
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
                completeOnContinue,
            },
            priority,
        );
        if (id) {
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
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        let {
            direction = "right",
            completeOnContinue = true,
            tickerIdToResume = [],
            aliasToRemoveAfter = [],
            animateOldComponentOut = true,
            motionBlur,
            ...options
        } = props;
        const res: string[] = [];
        let destination:
            | undefined
            | { x: number; y: number; type: "pixel" | "percentage" | "align" };
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
        let oldComponentAlias: string | undefined;
        const oldComponent = canvas.find(alias);
        if (oldComponent) {
            oldComponentAlias = `${alias}_temp_push`;
            canvas.editAlias(alias, oldComponentAlias);
            if (oldComponent instanceof ImageSprite || oldComponent instanceof ImageContainer) {
                destination = oldComponent.positionInfo;
            } else {
                destination = { x: oldComponent.x, y: oldComponent.y, type: "pixel" };
            }
        }
        // add the new component and transfer the properties of the old component to the new component
        component = addComponent(alias, component, {
            zIndex: oldComponent ? oldComponent.parent?.getChildIndex(oldComponent) : undefined,
        });
        oldComponent?.parent?.setChildIndex(
            oldComponent,
            oldComponent.parent.getChildIndex(oldComponent) - 0.1,
        );
        oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
        oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "move");
        // edit the properties of the new component
        if (!destination) {
            if (
                (component instanceof ImageSprite || component instanceof ImageContainer) &&
                component.haveEmptyTexture
            ) {
                destination = component.positionInfo;
            } else {
                destination = { x: component.x, y: component.y, type: "pixel" };
            }
        }
        // load the image if the image is not loaded
        if (
            (component instanceof ImageSprite || component instanceof ImageContainer) &&
            component.haveEmptyTexture
        ) {
            await component.load();
        }
        // edit the properties of the new component
        switch (direction) {
            case "up":
                component.y = canvas.height + component.height;
                break;
            case "down":
                component.y = -component.height;
                break;
            case "left":
                component.x = canvas.width + component.width;
                break;
            case "right":
                component.x = -component.width;
                break;
        }
        const ids = tickers.pause({ canvasAlias: alias });
        tickerIdToResume.push(...ids);
        // remove the old component
        if (oldComponentAlias) {
            if (animateOldComponentOut) {
                const ids = pushOut(oldComponentAlias, {
                    ...options,
                    direction,
                    motionBlur,
                    completeOnContinue,
                });
                if (ids) {
                    res.push(...ids);
                }
            } else {
                aliasToRemoveAfter.push(oldComponentAlias);
            }
        }
        // create the ticker and play it
        const idShow = canvas.animate(
            alias,
            mapDestination(destination) as any,
            {
                ...options,
                tickerIdToResume,
                aliasToRemoveAfter,
                completeOnContinue,
            },
            priority,
        );
        idShow && res.push(idShow);
        const idBlur = addMoveMotionBlur(
            alias,
            component,
            direction,
            motionBlur,
            { ...options, completeOnContinue },
            priority,
        );
        idBlur && res.push(idBlur);
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
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return moveOut(alias, props, priority);
    }

    /**
     * Show a image in the canvas with a wipe effect: the image is progressively revealed by a moving
     * boundary. The direction/angle and inversion are all configurable, so the same primitive can
     * produce horizontal, vertical, or diagonal reveals - see {@link WipeInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
     * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
     * If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function wipeIn(
        alias: string,
        component?: TComponent,
        props: WipeInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const {
            angle,
            direction = "right",
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
            animateOldComponentOut = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (!component) {
            component = alias;
        }
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component,
            "wipe",
        );
        const oldOut = handleOldComponent(
            oldComponentAlias,
            animateOldComponentOut,
            aliasToRemoveAfter,
            (old) =>
                wipeOut(
                    old,
                    {
                        ...oldComponentOutProps(props),
                        angle: (angle ?? directionToAngle(direction)) + 180,
                    },
                    priority,
                ),
        );
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const config: WipeFilterConfig = {
            kind: "wipe",
            angle: angle ?? directionToAngle(direction),
            invert,
            bounds: snapshotLocalBounds(newComponent),
        };
        const id = addMotionValueEffect(
            alias,
            {
                config,
                from: 0,
                to: 1,
                duration,
                delay,
                ease,
                completeOnContinue,
                aliasToRemoveAfter,
            },
            priority,
        );
        return withIds(id, oldOut);
    }

    /**
     * Remove a image from the canvas with a wipe effect: the image is progressively concealed by a
     * moving boundary. See {@link wipeIn} and {@link WipeInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function wipeOut(
        alias: string,
        props: WipeInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        const {
            angle,
            direction = "right",
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const config: WipeFilterConfig = {
            kind: "wipe",
            angle: angle ?? directionToAngle(direction),
            invert,
            bounds: snapshotLocalBounds(component),
        };
        const id = addMotionValueEffect(
            alias,
            {
                config,
                from: 1,
                to: 0,
                duration,
                delay,
                ease,
                completeOnContinue,
                aliasToRemoveAfter,
            },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Show a image in the canvas with an iris effect: the image is progressively revealed by an
     * expanding radial mask. Moving {@link IrisInOutProps.origin} off-center makes the same primitive
     * useful as a focus/reveal effect (e.g. centered on a character).
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
     * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
     * If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function irisIn(
        alias: string,
        component?: TComponent,
        props: IrisInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const {
            origin = {},
            aspect = 1,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
            animateOldComponentOut = true,
            direction = "expand",
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (!component) {
            component = alias;
        }
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component,
            "iris",
        );
        const oldOut = handleOldComponent(
            oldComponentAlias,
            animateOldComponentOut,
            aliasToRemoveAfter,
            (old) =>
                irisOut(
                    old,
                    {
                        ...oldComponentOutProps(props),
                        direction: direction === "contract" ? "expand" : "contract",
                    },
                    priority,
                ),
        );
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const config: IrisFilterConfig = {
            kind: "iris",
            outside: direction === "contract",
            originX: origin.x ?? 0.5,
            originY: origin.y ?? 0.5,
            aspect,
            invert,
            bounds: snapshotLocalBounds(newComponent),
        };
        const id = addMotionValueEffect(
            alias,
            {
                config,
                from: direction === "contract" ? 1 : 0,
                to: direction === "contract" ? 0 : 1,
                duration,
                delay,
                ease,
                completeOnContinue,
                aliasToRemoveAfter,
            },
            priority,
        );
        return withIds(id, oldOut);
    }

    /**
     * Remove a image from the canvas with an iris effect: the image is progressively concealed by a
     * contracting radial mask. See {@link irisIn} and {@link IrisInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function irisOut(
        alias: string,
        props: IrisInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        const {
            origin = {},
            aspect = 1,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
            direction = "expand",
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const config: IrisFilterConfig = {
            kind: "iris",
            outside: direction === "contract",
            originX: origin.x ?? 0.5,
            originY: origin.y ?? 0.5,
            aspect,
            invert,
            bounds: snapshotLocalBounds(component),
        };
        const id = addMotionValueEffect(
            alias,
            {
                config,
                from: direction === "contract" ? 0 : 1,
                to: direction === "contract" ? 1 : 0,
                duration,
                delay,
                ease,
                completeOnContinue,
                aliasToRemoveAfter,
            },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Show a image in the canvas with a split effect: two mask panels slide together from the edges to
     * progressively reveal the image, meeting at the split line once fully shown. With
     * `direction: "outward"`, the reveal grows from the split line towards the edges instead.
     * During replacement, the old component's conceal follows the new component's reveal.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
     * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
     * If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function splitIn(
        alias: string,
        component?: TComponent,
        props: SplitInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const {
            orientation = "vertical",
            direction = "inward",
            origin = 0.5,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
            animateOldComponentOut = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (!component) {
            component = alias;
        }
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component,
            "split",
        );
        const oldOut = handleOldComponent(
            oldComponentAlias,
            animateOldComponentOut,
            aliasToRemoveAfter,
            (old) => splitOut(old, {
                ...oldComponentOutProps(props),
                direction: direction === "inward" ? "outward" : "inward",
            }, priority),
        );
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const config: SplitFilterConfig = {
            kind: "split",
            orientation,
            direction,
            origin,
            invert,
            bounds: snapshotLocalBounds(newComponent),
        };
        const id = addMotionValueEffect(
            alias,
            {
                config,
                from: 0,
                to: 1,
                duration,
                delay,
                ease,
                completeOnContinue,
                aliasToRemoveAfter,
            },
            priority,
        );
        return withIds(id, oldOut);
    }

    /**
     * Remove a image from the canvas with a split effect: two mask panels retract apart toward the
     * edges to progressively conceal the image. With `direction: "outward"`, the visible region
     * shrinks from the edges towards the split line. See {@link splitIn} and {@link SplitInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function splitOut(
        alias: string,
        props: SplitInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        const {
            orientation = "vertical",
            direction = "inward",
            origin = 0.5,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const config: SplitFilterConfig = {
            kind: "split",
            orientation,
            direction,
            origin,
            invert,
            bounds: snapshotLocalBounds(component),
        };
        const id = addMotionValueEffect(
            alias,
            {
                config,
                from: 1,
                to: 0,
                duration,
                delay,
                ease,
                completeOnContinue,
                aliasToRemoveAfter,
            },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Show a image in the canvas with a blur effect: the image appears already blurred and sharpens
     * into focus. A generic blur, not a "dream"/"flashback" transition specifically - combine it with
     * {@link showWithFade} for that recipe. See {@link BlurInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
     * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
     * If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function blurIn(
        alias: string,
        component?: TComponent,
        props: BlurInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const {
            strength = 32,
            quality = 4,
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = true,
            animateOldComponentOut = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (!component) {
            component = alias;
        }
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component,
            "blur",
        );
        const oldOut = handleOldComponent(
            oldComponentAlias,
            animateOldComponentOut,
            aliasToRemoveAfter,
            (old) => blurOut(old, oldComponentOutProps(props), priority),
        );
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const resolvedDuration = duration ?? 1;
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, newComponent, "in", resolvedDuration, priority);
        }
        const filter = new filters.BlurFilter({ strength, quality });
        const id = addMotionFilterEffect(
            alias,
            newComponent,
            filter,
            { strength: [strength, 0] },
            { duration: resolvedDuration, delay, ease, completeOnContinue, aliasToRemoveAfter },
            priority,
        );
        return withIds(id, oldOut);
    }

    /**
     * Remove a image from the canvas with a blur effect: the image blurs out of focus before being
     * removed. See {@link blurIn} and {@link BlurInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function blurOut(
        alias: string,
        props: BlurInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        const {
            strength = 32,
            quality = 4,
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const resolvedDuration = duration ?? 1;
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, component, "out", resolvedDuration, priority);
        }
        const filter = new filters.BlurFilter({ strength: 0, quality });
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { strength: [0, strength] },
            { duration: resolvedDuration, delay, ease, completeOnContinue, aliasToRemoveAfter },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Show a image in the canvas with a pixelate effect: the image appears pixelated and resolves into
     * focus. Useful for retro effects, digital transitions, censorship/stylization, or scene changes -
     * not only "glitch" scenes. See {@link PixelateInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
     * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
     * If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function pixelateIn(
        alias: string,
        component?: TComponent,
        props: PixelateInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const {
            pixelSize = 32,
            direction = "up-left",
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = false,
            animateOldComponentOut = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (!component) {
            component = alias;
        }
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component,
            "pixelate",
        );
        const oldOut = handleOldComponent(
            oldComponentAlias,
            animateOldComponentOut,
            aliasToRemoveAfter,
            (old) => pixelateOut(old, oldComponentOutProps(props), priority),
        );
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const resolvedDuration = duration ?? 1;
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, newComponent, "in", resolvedDuration, priority);
        }
        const keyframes = pixelateKeyframes(pixelSize, direction, "in");
        const filter = new filters.PixelateFilter([keyframes.sizeX[0], keyframes.sizeY[0]]);
        const id = addMotionFilterEffect(
            alias,
            newComponent,
            filter,
            keyframes,
            { duration: resolvedDuration, delay, ease, completeOnContinue, aliasToRemoveAfter },
            priority,
        );
        return withIds(id, oldOut);
    }

    /**
     * Remove a image from the canvas with a pixelate effect: the image pixelates before being removed.
     * See {@link pixelateIn} and {@link PixelateInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function pixelateOut(
        alias: string,
        props: PixelateInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        const {
            pixelSize = 32,
            direction = "up-left",
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = false,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const resolvedDuration = duration ?? 1;
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, component, "out", resolvedDuration, priority);
        }
        const keyframes = pixelateKeyframes(pixelSize, direction, "out");
        const filter = new filters.PixelateFilter([keyframes.sizeX[0], keyframes.sizeY[0]]);
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            keyframes,
            { duration: resolvedDuration, delay, ease, completeOnContinue, aliasToRemoveAfter },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    function pixelateKeyframes(
        pixelSize: number,
        direction: NonNullable<PixelateInOutProps["direction"]>,
        phase: "in" | "out",
    ) {
        // PixelateFilter quantizes with floor(coord / size) * size. A negative size selects
        // ceil instead of floor, mirroring the sampling on that axis without flipping the image.
        // Growing blocks must use the opposite sampling corner to shrinking blocks to drift in
        // the same direction. Keep each axis's sign constant so it never crosses zero.
        const phaseSign = phase === "in" ? 1 : -1;
        const xSign = (direction.endsWith("left") ? 1 : -1) * phaseSign;
        const ySign = (direction.startsWith("up") ? 1 : -1) * phaseSign;
        const size = Math.max(1, Math.abs(pixelSize));
        const sizes = phase === "in" ? [size, 1] : [1, size];
        return {
            sizeX: sizes.map((value) => value * xSign),
            sizeY: sizes.map((value) => value * ySign),
        };
    }

    /**
     * Show a image in the canvas with a flash effect, with a configurable solid-color overlay (not
     * limited to a white flash). White reads as a camera/explosion-like flash, black as a blink/cut, and
     * arbitrary colors work for damage/magic/memory/UI transitions. See {@link FlashInOutProps}.
     *
     * If `alias` has no existing component, the new image appears immediately and the overlay fades in
     * and back out over it. If `alias` already has a component, the *current* content fades up to
     * `color` first, is swapped for the new content at the exact moment the screen is a solid `color`
     * (so the content change itself is invisible), and the new content then fades back down from `color`
     * to normal - see {@link flashReplace}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If imageUrl is a video, then the {@link VideoSprite} is added to the canvas.
     * If imageUrl is an array, then the {@link ImageContainer} is added to the canvas.
     * If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function flashIn(
        alias: string,
        component?: TComponent,
        props: FlashInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const {
            color = 0xffffff,
            maxAlpha = 1,
            duration: fadeDuration = 0.3,
            holdDuration = 0,
            pulses = 1,
            completeOnContinue = true,
            fadeComponent = true,
            ...rest
        } = props;
        if (!component) {
            component = alias;
        }
        const existingComponent = canvas.find(alias);
        if (existingComponent) {
            // `flashReplace` never needs `fadeComponent`: both sides are already hidden under a solid
            // `color` at the moment of the swap, so there's no pop to soften.
            return flashReplace(alias, existingComponent, component, {
                color,
                maxAlpha,
                fadeDuration,
                holdDuration,
                pulses,
                completeOnContinue,
                rest,
                priority,
            });
        }
        const { component: newComponent } = swapComponentForEffect(alias, component, "flash");
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, newComponent, "in", fadeDuration, priority);
        }
        const res: string[] = [];
        const overlayId = addFlashOverlay(newComponent, {
            color,
            maxAlpha,
            fadeDuration,
            holdDuration,
            pulses,
            completeOnContinue,
            aliasToRemoveAfter: [],
            rest,
            priority,
        });
        overlayId && res.push(overlayId);
        if (res.length > 0) {
            return res;
        }
    }

    /**
     * Remove a image from the canvas with a flash effect: a configurable solid-color overlay fades up to
     * `color` and back down to normal, and the image is removed the instant that finishes - the removal
     * itself is a hard cut, never an additional fade/dissolve. See {@link flashIn} and
     * {@link FlashInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function flashOut(
        alias: string,
        props: FlashInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        const {
            color = 0xffffff,
            maxAlpha = 1,
            duration: fadeDuration = 0.3,
            holdDuration = 0,
            pulses = 1,
            completeOnContinue = true,
            fadeComponent = true,
            ...rest
        } = props;
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        if (fadeComponent) {
            // Mirrors `flashIn`'s own fade-in, but timed against the *whole* flash cycle (all pulses),
            // not just a single ramp, so the component finishes fading out exactly when the last pulse's
            // color has faded back to normal.
            const { total } = buildFlashKeyframes(maxAlpha, fadeDuration, holdDuration, pulses);
            fadeComponentAlongsideEffect(alias, component, "out", total, priority);
        }
        const id = addFlashOverlay(component, {
            color,
            maxAlpha,
            fadeDuration,
            holdDuration,
            pulses,
            completeOnContinue,
            aliasToRemoveAfter: [alias],
            rest,
            priority,
        });
        if (id) {
            return [id];
        }
    }

    /**
     * Shared implementation for {@link flashIn} (fresh element)/{@link flashOut}: tints `target` with a
     * `ColorOverlayFilter` and animates its alpha via `addMotionFilterEffect`, using the multi-stop
     * keyframe idiom {@link effects.shakeEffect} already uses. A filter (rather than a solid rectangle
     * over the bounds) only colors the visible pixels, so the transparent parts of the image stay
     * transparent.
     */
    function addFlashOverlay(
        target: CanvasBaseInterface<any>,
        options: {
            color: ColorType;
            maxAlpha: number;
            fadeDuration: number;
            holdDuration: number;
            pulses: number;
            completeOnContinue: boolean;
            aliasToRemoveAfter: string[];
            /** @default false */
            endAtPeak?: boolean;
            rest: Omit<
                FlashInOutProps,
                "color" | "maxAlpha" | "duration" | "holdDuration" | "pulses" | "completeOnContinue"
            >;
            priority?: UPDATE_PRIORITY;
        },
    ): string | undefined {
        const { values, times, total } = buildFlashKeyframes(
            options.maxAlpha,
            options.fadeDuration,
            options.holdDuration,
            options.pulses,
            options.endAtPeak ?? false,
        );
        const filter = new filters.ColorOverlayFilter({ color: options.color as any, alpha: 0 });
        return addMotionFilterEffect(
            target.label as string,
            target,
            filter,
            { alpha: values },
            {
                duration: total,
                times,
                delay: options.rest.delay,
                ease: options.rest.ease,
                aliasToRemoveAfter: options.aliasToRemoveAfter,
                completeOnContinue: options.completeOnContinue,
            },
            options.priority,
        );
    }

    /**
     * Stages both images before starting the flash. A shared timeline switches their alpha at the
     * last color peak, then reveals the new image. Every part is a registered ticker, so going back
     * cancels the entire transition and a saved replacement resumes without a delayed callback.
     */
    async function flashReplace(
        alias: string,
        oldComponent: CanvasBaseInterface<any>,
        component: TComponent,
        options: {
            color: ColorType;
            maxAlpha: number;
            fadeDuration: number;
            holdDuration: number;
            pulses: number;
            completeOnContinue: boolean;
            rest: Omit<
                FlashInOutProps,
                "color" | "maxAlpha" | "duration" | "holdDuration" | "pulses" | "completeOnContinue"
            >;
            priority?: UPDATE_PRIORITY;
        },
    ): Promise<string[] | undefined> {
        // Copy the old image's properties before attaching the temporary flash overlay, otherwise
        // the new image inherits a second, unanimated color filter and stays tinted after the flash.
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component,
            "flash",
        );
        if (!oldComponentAlias) {
            return;
        }
        const newAlpha = newComponent.alpha;
        const oldAlpha = oldComponent.alpha;
        newComponent.alpha = 0;
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const { values, times, total: upDuration } = buildFlashKeyframes(
            options.maxAlpha,
            options.fadeDuration,
            options.holdDuration,
            options.pulses,
            true,
        );
        const duration = upDuration + options.fadeDuration;
        const swapTime = upDuration / duration;
        const timing = {
            duration,
            delay: options.rest.delay,
            ease: options.rest.ease,
            completeOnContinue: options.completeOnContinue,
        };
        const oldOverlayId = addMotionFilterEffect(
            oldComponentAlias,
            oldComponent,
            new filters.ColorOverlayFilter({ color: options.color as any, alpha: 0 }),
            { alpha: [...values, options.maxAlpha] },
            {
                ...timing,
                times: [...times.map((time) => time * swapTime), 1],
                aliasToRemoveAfter: [oldComponentAlias],
            },
            options.priority,
        );
        const newOverlayId = addMotionFilterEffect(
            alias,
            newComponent,
            new filters.ColorOverlayFilter({ color: options.color as any, alpha: options.maxAlpha }),
            { alpha: [options.maxAlpha, options.maxAlpha, 0] },
            {
                ...timing,
                times: [0, swapTime, 1],
                aliasToRemoveAfter: options.rest.aliasToRemoveAfter,
            },
            options.priority,
        );
        // Repeated offsets make this a hard cut at the final peak, not a crossfade. Using the same
        // duration and delay as the overlays keeps the cut in sync through pause, restore and skip.
        const visibilityTiming = {
            duration,
            delay: options.rest.delay,
            times: [0, swapTime, swapTime, 1],
            ease: "linear" as const,
        };
        const oldVisibilityId = canvas.animate(
            oldComponentAlias,
            { alpha: [oldAlpha, oldAlpha, 0, 0] },
            visibilityTiming,
            options.priority,
        );
        const newVisibilityId = canvas.animate(
            alias,
            { alpha: [0, 0, newAlpha, newAlpha] },
            visibilityTiming,
            options.priority,
        );
        if (options.completeOnContinue) {
            oldVisibilityId && tickers.completeOnStepEnd({ id: oldVisibilityId });
            newVisibilityId && tickers.completeOnStepEnd({ id: newVisibilityId });
        }
        return collectTickerIds([oldOverlayId, newOverlayId, oldVisibilityId, newVisibilityId]);
    }

    /**
     * Adds the optional motion-blur trail of the move/push transitions ({@link MoveInOutProps.motionBlur}):
     * a `MotionBlurFilter` whose velocity ramps up along the movement axis and back to 0, so the
     * component always ends sharp. Without an explicit `duration` it assumes `motion`'s default 0.3s
     * tween; a mismatch only shifts when the trail peaks, never leaves it blurred.
     */
    function addMoveMotionBlur(
        alias: string,
        component: CanvasBaseInterface<any>,
        direction: "up" | "down" | "left" | "right",
        motionBlur: boolean | number | undefined,
        options: AnimationOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined {
        if (!motionBlur) {
            return;
        }
        const length = motionBlur === true ? 40 : motionBlur;
        const axis = direction === "up" || direction === "down" ? "velocityY" : "velocityX";
        const sign = direction === "up" || direction === "left" ? -1 : 1;
        const filter = new filters.MotionBlurFilter({ velocity: { x: 0, y: 0 }, kernelSize: 15 });
        return addMotionFilterEffect(
            alias,
            component,
            filter,
            { [axis]: [0, sign * length, 0] },
            {
                duration: options.duration ?? 0.3,
                delay: options.delay,
                ease: options.ease,
                completeOnContinue: options.completeOnContinue,
                autoplay: options.autoplay,
            },
            priority,
        );
    }

    /** Timing shared by every ticker of one filter-based transition (see {@link filterTransitionIn}). */
    interface FilterTransitionTiming {
        duration: number;
        delay?: AnimationOptions["delay"];
        ease?: AnimationOptions["ease"];
        completeOnContinue: boolean;
    }

    /** Callback adding a filter-based transition's ticker(s); `aliasToRemoveAfter` belongs on its main ticker. */
    type AttachFilterTransition = (
        component: CanvasBaseInterface<any>,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
    ) => (string | undefined)[];

    function collectTickerIds(ids: (string | undefined)[]): string[] | undefined {
        const res = ids.filter((id): id is string => !!id);
        return res.length > 0 ? res : undefined;
    }

    /**
     * Shared scaffolding for the filter-based `xIn` transitions - the same steps {@link blurIn} spells
     * out: swaps in the new component (the replaced one is removed once the effect ends), loads its
     * texture, optionally fades it in alongside, then lets `attach` add the actual filter ticker(s).
     */
    async function filterTransitionIn(
        alias: string,
        component: TComponent | undefined,
        tag: string,
        props: FilterFadeTransitionProps,
        defaultFadeComponent: boolean,
        priority: UPDATE_PRIORITY | undefined,
        attach: AttachFilterTransition,
        playOldOut: (oldComponentAlias: string) => string[] | undefined,
        sequential: boolean = false,
    ): Promise<string[] | undefined> {
        const {
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = defaultFadeComponent,
            animateOldComponentOut = true,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
            alias,
            component ?? alias,
            tag,
        );
        const oldOut = handleOldComponent(
            oldComponentAlias,
            animateOldComponentOut,
            aliasToRemoveAfter,
            playOldOut,
        );
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const resolvedDuration = duration ?? 1;
        // `sequential`: the new component starts once the replaced one has finished leaving.
        const resolvedDelay =
            sequential && oldOut.length > 0
                ? typeof delay === "function"
                    ? (index: number, total: number) => delay(index, total) + resolvedDuration
                    : (delay ?? 0) + resolvedDuration
                : delay;
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, newComponent, "in", resolvedDuration, priority);
        }
        return collectTickerIds([
            ...attach(
                newComponent,
                { duration: resolvedDuration, delay: resolvedDelay, ease, completeOnContinue },
                aliasToRemoveAfter,
            ),
            ...oldOut,
        ]);
    }

    /**
     * Shared scaffolding for the filter-based `xOut` transitions - the same steps {@link blurOut}
     * spells out: optionally fades the component out alongside, lets `attach` add the filter ticker(s),
     * and the component is removed once the main ticker completes.
     */
    function filterTransitionOut(
        alias: string,
        props: FilterFadeTransitionProps,
        defaultFadeComponent: boolean,
        priority: UPDATE_PRIORITY | undefined,
        attach: AttachFilterTransition,
    ): string[] | undefined {
        const {
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = defaultFadeComponent,
        } = props;
        let { aliasToRemoveAfter = [] } = props;
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        aliasToRemoveAfter.push(alias);
        const component = canvas.find(alias);
        if (!component) {
            logger.warn(`The canvas component "${alias}" is not found.`);
            return;
        }
        const resolvedDuration = duration ?? 1;
        if (fadeComponent) {
            fadeComponentAlongsideEffect(alias, component, "out", resolvedDuration, priority);
        }
        return collectTickerIds(
            attach(
                component,
                { duration: resolvedDuration, delay, ease, completeOnContinue },
                aliasToRemoveAfter,
            ),
        );
    }

    function halfDiagonal(component: CanvasBaseInterface<any>): number {
        const { width, height } = component.getBounds();
        return Math.hypot(width, height) / 2;
    }

    function resolveOrigin(origin?: Partial<PointData>): { x: number; y: number } {
        return { x: origin?.x ?? 0.5, y: origin?.y ?? 0.5 };
    }

    function addGlitchTickers(
        alias: string,
        component: CanvasBaseInterface<any>,
        phase: "in" | "out",
        props: GlitchInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { strength = 40, bursts = 3, slices = 8, rgbSplit = 6 } = props;
        // `glitchIn` starts at its strongest and settles; `glitchOut` builds up towards removal.
        const shape = (peak: number) => {
            const values = buildGlitchJitter(peak, 0.5, bursts);
            return phase === "in" ? values : values.reverse();
        };
        const args = { ...timing, ease: timing.ease ?? "linear" };
        const glitch = new filters.GlitchFilter({ slices, offset: 0 });
        glitch.refresh();
        // Room for slices shifted past the component's edges (otherwise they're cut off).
        glitch.padding = Math.ceil(Math.abs(strength));
        const ids = [
            addMotionFilterEffect(
                alias,
                component,
                glitch as Filter,
                { offset: shape(strength) },
                { ...args, aliasToRemoveAfter },
                priority,
            ),
        ];
        if (rgbSplit !== 0) {
            const envelope = shape(rgbSplit);
            const split = new filters.RGBSplitFilter({
                red: { x: 0, y: 0 },
                green: { x: 0, y: 0 },
                blue: { x: 0, y: 0 },
            });
            split.padding = Math.ceil(Math.abs(rgbSplit));
            ids.push(
                addMotionFilterEffect(
                    alias,
                    component,
                    split,
                    { redX: envelope, blueX: envelope.map((v) => -v) },
                    args,
                    priority,
                ),
            );
        }
        return ids;
    }

    /**
     * Show a image in the canvas with a glitch effect: the image materializes out of jittery bursts of
     * digital-corruption slices with red/blue fringing, which settle as it appears. See
     * {@link GlitchInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function glitchIn(
        alias: string,
        component?: TComponent,
        props: GlitchInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "glitch",
            props,
            true,
            priority,
            (target, timing, remove) =>
                addGlitchTickers(alias, target, "in", props, timing, remove, priority),
            (old) => glitchOut(old, oldComponentOutProps(props), priority),
        );
    }

    /**
     * Remove a image from the canvas with a glitch effect: digital-corruption bursts build up until the
     * image is removed. See {@link glitchIn} and {@link GlitchInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function glitchOut(
        alias: string,
        props: GlitchInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, true, priority, (target, timing, remove) =>
            addGlitchTickers(alias, target, "out", props, timing, remove, priority),
        );
    }

    function addTwistTicker(
        alias: string,
        component: CanvasBaseInterface<any>,
        phase: "in" | "out",
        props: TwistInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { angle = 540, radius = halfDiagonal(component), origin } = props;
        const center = resolveOrigin(origin);
        const wound = (angle * Math.PI) / 180;
        const keyframes = phase === "in" ? [wound, 0] : [0, wound];
        // `offset` must be a fresh object: TwistFilter's default one is shared by every instance, so setting
        // the center on one twist would silently move it on all the others (a small image next to a big
        // one would get the big one's center, far outside itself, and show no effect at all).
        const filter = new filters.TwistFilter({ radius, angle: keyframes[0], offset: { x: 0, y: 0 } });
        // The swirl rotates content within `radius` of the center - room for the part of that circle
        // that overhangs the component, so it isn't cut off (never less than TwistFilter's own default).
        const { width, height } = component.getBounds();
        filter.padding = Math.max(
            filter.padding,
            circleOverhang({ x: center.x * width, y: center.y * height }, radius, width, height),
        );
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { angle: keyframes },
            { ...timing, aliasToRemoveAfter },
            priority,
        );
        const { x, y } = componentFilterCenter(component, center);
        filter.offsetX = x;
        filter.offsetY = y;
        return [id];
    }

    /**
     * Show a image in the canvas with a twist effect: the image unwinds out of a swirl, like coming
     * through a vortex or portal. See {@link TwistInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function twistIn(
        alias: string,
        component?: TComponent,
        props: TwistInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "twist",
            props,
            true,
            priority,
            (target, timing, remove) =>
                addTwistTicker(alias, target, "in", props, timing, remove, priority),
            (old) => twistOut(old, {
                ...oldComponentOutProps(props),
                angle: -(props.angle ?? 540),
            }, priority),
        );
    }

    /**
     * Remove a image from the canvas with a twist effect: the image winds up into a swirl before being
     * removed. See {@link twistIn} and {@link TwistInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function twistOut(
        alias: string,
        props: TwistInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, true, priority, (target, timing, remove) =>
            addTwistTicker(alias, target, "out", props, timing, remove, priority),
        );
    }

    function addWarpTicker(
        alias: string,
        component: CanvasBaseInterface<any>,
        phase: "in" | "out",
        props: WarpInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { strength = 0.6, origin } = props;
        const center = resolveOrigin(origin);
        const keyframes = phase === "in" ? [strength, 0] : [0, strength];
        const filter = new filters.ZoomBlurFilter({
            center: { x: 0, y: 0 },
            strength: keyframes[0],
        });
        const { width, height } = component.getBounds();
        filter.padding = zoomBlurPadding(
            { x: center.x * width, y: center.y * height },
            strength,
            width,
            height,
        );
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { strength: keyframes },
            { ...timing, aliasToRemoveAfter },
            priority,
        );
        const { x, y } = componentFilterCenter(component, center);
        filter.center = { x, y };
        return [id];
    }

    /**
     * Show a image in the canvas with a warp effect: the image arrives out of radial zoom-blur streaks,
     * like dropping out of hyperspace. See {@link WarpInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function warpIn(
        alias: string,
        component?: TComponent,
        props: WarpInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "warp",
            props,
            true,
            priority,
            (target, timing, remove) =>
                addWarpTicker(alias, target, "in", props, timing, remove, priority),
            (old) => warpOut(old, oldComponentOutProps(props), priority),
        );
    }

    /**
     * Remove a image from the canvas with a warp effect: the image streaks away in a radial zoom blur
     * before being removed. See {@link warpIn} and {@link WarpInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function warpOut(
        alias: string,
        props: WarpInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, true, priority, (target, timing, remove) =>
            addWarpTicker(alias, target, "out", props, timing, remove, priority),
        );
    }

    function addRippleTicker(
        alias: string,
        component: CanvasBaseInterface<any>,
        props: RippleInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { origin, amplitude = 30, wavelength = 160, speed = 500 } = props;
        const center = resolveOrigin(origin);
        const { width, height } = component.getBounds();
        const filter = new filters.ShockwaveFilter({
            center: { x: 0, y: 0 },
            amplitude,
            wavelength,
            speed,
            time: 0,
        });
        // The shader displaces by up to 1.25x `amplitude` - room for edges pushed past the bounds.
        filter.padding = Math.ceil(Math.abs(amplitude) * 1.25);
        const time =
            shockwaveTravel(
                { x: center.x * width, y: center.y * height },
                { width, height },
                wavelength,
                -1,
            ) / speed;
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { time: [0, time] },
            { ...timing, aliasToRemoveAfter },
            priority,
        );
        const { x, y } = componentFilterCenter(component, center);
        filter.center = { x, y };
        return [id];
    }

    /**
     * Show a image in the canvas with a ripple effect: the image fades in through a ring of water-like
     * distortion spreading outward from an origin point - for dreams, magic or memories. See
     * {@link RippleInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function rippleIn(
        alias: string,
        component?: TComponent,
        props: RippleInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "ripple",
            props,
            true,
            priority,
            (target, timing, remove) =>
                addRippleTicker(alias, target, props, timing, remove, priority),
            (old) =>
                removeWithDissolve(
                    old,
                    {
                        duration: props.duration,
                        delay: props.delay,
                        ease: props.ease,
                        completeOnContinue: props.completeOnContinue,
                    },
                    priority,
                ),
        );
    }

    /**
     * Remove a image from the canvas with a ripple effect: a ring of water-like distortion spreads over
     * the image as it fades out and is removed. See {@link rippleIn} and {@link RippleInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function rippleOut(
        alias: string,
        props: RippleInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, true, priority, (target, timing, remove) =>
            addRippleTicker(alias, target, props, timing, remove, priority),
        );
    }

    function addNoiseDissolveTicker(
        alias: string,
        component: CanvasBaseInterface<any>,
        phase: "in" | "out",
        props: NoiseDissolveInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { edge = "hard", noiseScale = 8, seed = Math.random() * 1000 } = props;
        // SimplexNoiseFilter outputs `texture * clamp(noise + 2 * strength - 1)`, thresholded at `step`
        // when `step > 0`: fully hidden -> fully shown spans strength 0 -> 1 soft, 0.25 -> 0.75 hard.
        const [hidden, shown] = edge === "hard" ? [0.25, 0.75] : [0, 1];
        const keyframes = phase === "in" ? [hidden, shown] : [shown, hidden];
        const filter = new filters.SimplexNoiseFilter({
            strength: keyframes[0],
            noiseScale,
            offsetZ: seed,
            step: edge === "hard" ? 0.5 : 0,
        });
        return [
            addMotionFilterEffect(
                alias,
                component,
                filter,
                { strength: keyframes },
                { ...timing, aliasToRemoveAfter },
                priority,
            ),
        ];
    }

    /**
     * Show a image in the canvas with a noise dissolve: the image appears in organic, noise-shaped
     * blotches (or a cloudy fade with `edge: "soft"`) - the classic visual-novel image dissolve. See
     * {@link NoiseDissolveInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function noiseDissolveIn(
        alias: string,
        component?: TComponent,
        props: NoiseDissolveInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "noise",
            props,
            false,
            priority,
            (target, timing, remove) =>
                addNoiseDissolveTicker(alias, target, "in", props, timing, remove, priority),
            (old) => noiseDissolveOut(old, oldComponentOutProps(props), priority),
        );
    }

    /**
     * Remove a image from the canvas with a noise dissolve: the image disappears in noise-shaped
     * blotches and is then removed. See {@link noiseDissolveIn} and {@link NoiseDissolveInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function noiseDissolveOut(
        alias: string,
        props: NoiseDissolveInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, false, priority, (target, timing, remove) =>
            addNoiseDissolveTicker(alias, target, "out", props, timing, remove, priority),
        );
    }

    function addTvTickers(
        alias: string,
        component: CanvasBaseInterface<any>,
        phase: "in" | "out",
        props: TvInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { lineThickness = 0.02, brightness = 3, scanlines = true } = props;
        const sx = component.scale.x;
        const sy = component.scale.y;
        const line = sy * lineThickness;
        // Out: collapse to a bright horizontal line, then to a dot. In: the same, reversed.
        const times = phase === "in" ? [0, 0.45, 1] : [0, 0.55, 1];
        const scaleX = phase === "in" ? [0, sx, sx] : [sx, sx, 0];
        const scaleY = phase === "in" ? [line, line, sy] : [sy, line, line];
        const glow = phase === "in" ? [brightness, brightness, 1] : [1, brightness, brightness];
        if (phase === "in") {
            component.scale.set(0, line);
        }
        const ids = [
            canvas.animate(
                alias,
                { scaleX, scaleY },
                {
                    duration: timing.duration,
                    delay: timing.delay,
                    ease: timing.ease,
                    times,
                    completeOnContinue: timing.completeOnContinue,
                    aliasToRemoveAfter,
                },
                priority,
            ),
            addMotionFilterEffect(
                alias,
                component,
                new filters.AdjustmentFilter({ brightness: glow[0] }),
                { brightness: glow },
                { ...timing, times },
                priority,
            ),
        ];
        if (scanlines) {
            const lines = phase === "in" ? [0.5, 0.5, 0] : [0, 0.5, 0.5];
            ids.push(
                addMotionFilterEffect(
                    alias,
                    component,
                    new filters.CRTFilter({
                        curvature: 0,
                        vignettingAlpha: 0,
                        lineWidth: 3,
                        lineContrast: lines[0],
                        noise: lines[0],
                    }),
                    { lineContrast: lines, noise: lines },
                    { ...timing, times },
                    priority,
                ),
            );
        }
        return ids;
    }

    /**
     * Show a image in the canvas like an old TV turning on: a bright dot stretches into a glowing
     * horizontal line, which then opens up into the full image, with CRT scanlines. The scale animates
     * around the component's own anchor/pivot, so a centered anchor looks best. See
     * {@link TvInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function tvIn(
        alias: string,
        component?: TComponent,
        props: TvInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "tv",
            props,
            false,
            priority,
            (target, timing, remove) =>
                addTvTickers(alias, target, "in", props, timing, remove, priority),
            (old) => tvOut(old, oldComponentOutProps(props), priority),
            true,
        );
    }

    /**
     * Remove a image from the canvas like an old TV turning off: the image collapses into a glowing
     * horizontal line, then into a dot, and is removed. The scale animates around the component's own
     * anchor/pivot, so a centered anchor looks best. See {@link tvIn} and {@link TvInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function tvOut(
        alias: string,
        props: TvInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, false, priority, (target, timing, remove) =>
            addTvTickers(alias, target, "out", props, timing, remove, priority),
        );
    }

    function addPinchTicker(
        alias: string,
        component: CanvasBaseInterface<any>,
        phase: "in" | "out",
        props: PinchInOutProps,
        timing: FilterTransitionTiming,
        aliasToRemoveAfter: string[],
        priority?: UPDATE_PRIORITY,
    ): (string | undefined)[] {
        const { strength = 1, mode = "pinch", radius = halfDiagonal(component), origin } = props;
        const peak = (mode === "bulge" ? 1 : -1) * strength;
        const center = resolveOrigin(origin);
        const keyframes = phase === "in" ? [peak, 0] : [0, peak];
        const filter = new filters.BulgePinchFilter({ center, radius, strength: keyframes[0] });
        if (mode === "bulge") {
            // A bulge pushes content outward, up to `radius` from the center; a pinch only pulls inward.
            const { width, height } = component.getBounds();
            filter.padding = circleOverhang(
                { x: center.x * width, y: center.y * height },
                radius,
                width,
                height,
            );
        }
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { strength: keyframes },
            { ...timing, aliasToRemoveAfter },
            priority,
        );
        // BulgePinchFilter's `center` is normalized to the filter area (`uCenter * uDimensions`), which
        // padding and viewport clipping make differ from the component's own bounds.
        const { x, y, area } = componentFilterCenter(component, center);
        filter.center = { x: x / area.width, y: y / area.height };
        return [id];
    }

    /**
     * Show a image in the canvas with a pinch effect: the image emerges from a single point, deforming
     * outward as it settles (or puffs out of it with `mode: "bulge"`). See {@link PinchInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param component The imageUrl, array of imageUrl or the canvas component. If you don't provide the component, then the alias is used as the url.
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns A promise that contains the ids of the tickers that are used in the effect. The promise is resolved when the image is loaded.
     */
    export async function pinchIn(
        alias: string,
        component?: TComponent,
        props: PinchInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        return filterTransitionIn(
            alias,
            component,
            "pinch",
            props,
            true,
            priority,
            (target, timing, remove) =>
                addPinchTicker(alias, target, "in", props, timing, remove, priority),
            (old) =>
                removeWithDissolve(
                    old,
                    {
                        duration: props.duration,
                        delay: props.delay,
                        ease: props.ease,
                        completeOnContinue: props.completeOnContinue,
                    },
                    priority,
                ),
        );
    }

    /**
     * Remove a image from the canvas with a pinch effect: the image is sucked into a single point (or
     * puffs out with `mode: "bulge"`) and removed. See {@link pinchIn} and {@link PinchInOutProps}.
     * @param alias The unique alias of the image. You can use this alias to refer to this image
     * @param props The properties of the effect
     * @param priority The priority of the effect
     * @returns The ids of the tickers that are used in the effect.
     */
    export function pinchOut(
        alias: string,
        props: PinchInOutProps = {},
        priority?: UPDATE_PRIORITY,
    ): string[] | undefined {
        return filterTransitionOut(alias, props, true, priority, (target, timing, remove) =>
            addPinchTicker(alias, target, "out", props, timing, remove, priority),
        );
    }
}
