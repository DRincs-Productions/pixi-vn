import {
    applyFilterTransition,
    cleanupFilterTransition,
    snapshotLocalBounds,
    type FilterTransitionConfig,
    type FilterTransitionContext,
    type IrisFilterConfig,
    type SplitFilterConfig,
    type WipeFilterConfig,
} from "@canvas/functions/canvas-filter-transition-utility";
import PixiContainer from "@canvas/components/Container";
import type { ColorType } from "@canvas/types/ColorType";
import { logger } from "@utils/log-utility";
import { filters } from "@drincs/pixi-vn/filters";
import type { AnimationOptions } from "@drincs/pixi-vn/motion";
import type {
    Container as PixiJsContainer,
    Filter,
    UPDATE_PRIORITY,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
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
    FlashInOutProps,
    IrisInOutProps,
    MoveInOutProps,
    PixelateInOutProps,
    PushInOutProps,
    ShowWithDissolveTransitionProps,
    ShowWithFadeTransitionProps,
    SplitInOutProps,
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
         * If true, then the old component is removed with a move out, after the new image is moved in.
         * @default false
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
         * If true, then the old component is removed with a zoom out, after the new image is zoomed in.
         * @default false
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
        oldComponentAlias && canvas.tickers.transfer(oldComponentAlias, alias, "duplicate");
        return { component: newComponent, oldComponentAlias };
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
        const ctx: FilterTransitionContext = {};
        const apply = (value: number) => {
            const component = canvas.find(alias);
            if (component) {
                applyFilterTransition(component, args.config, value, ctx);
            }
        };
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
            () => {
                const component = canvas.find(alias);
                if (component) {
                    cleanupFilterTransition(component, args.config, ctx);
                }
            },
        );
        if (id) {
            // Applies `from` immediately, the same frame the component is first rendered, mirroring what
            // `FilterProgressTicker`'s own `start()` override used to guarantee explicitly - it doesn't
            // rely on `motion`'s own synchronous first-keyframe write reaching `onUpdate` before the
            // ticker's first real tick, closing any gap where the component would render unmasked.
            apply(args.from);
        }
        if (id && (args.completeOnContinue ?? true)) {
            canvas.tickers.completeOnStepEnd({ id });
        }
        return id;
    }

    /**
     * Attaches `filter` to `component.filters` (preserving any filters already there) and drives
     * `keyframes` on the filter's own properties via `filters.animate` (`MotionFilterTicker`,
     * `motion`-backed - see {@link blurIn}/{@link pixelateIn}), detaching and destroying it once the
     * animation completes. The same "never leave the component in a different state than before the
     * transition" guarantee {@link addMotionValueEffect}'s mask cleanup gives wipe/iris/split.
     */
    function addMotionFilterEffect(
        alias: string,
        component: CanvasBaseInterface<any>,
        filter: Filter,
        keyframes: Record<string, number[]>,
        args: {
            duration?: number;
            delay?: number | ((index: number, total: number) => number);
            ease?: unknown;
            completeOnContinue?: boolean;
            aliasToRemoveAfter?: string[];
        },
        priority?: UPDATE_PRIORITY,
    ): string | undefined {
        const existingFilters = component.filters
            ? Array.isArray(component.filters)
                ? component.filters
                : [component.filters]
            : [];
        component.filters = [...existingFilters, filter];
        const id = filters.animate(
            alias,
            filter,
            keyframes,
            {
                duration: args.duration ?? 1,
                delay: args.delay,
                ease: args.ease as AnimationOptions["ease"],
                aliasToRemoveAfter: args.aliasToRemoveAfter,
            },
            priority,
            undefined,
            () => {
                const remaining = (
                    component.filters
                        ? Array.isArray(component.filters)
                            ? component.filters
                            : [component.filters]
                        : []
                ).filter((existing) => existing !== filter);
                component.filters = remaining.length > 0 ? remaining : null;
                filter.destroy();
            },
        );
        if (id && (args.completeOnContinue ?? true)) {
            canvas.tickers.completeOnStepEnd({ id });
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
        oldComponentAlias && canvas.tickers.transfer(oldComponentAlias, alias, "duplicate");
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
        oldComponentAlias && canvas.tickers.transfer(oldComponentAlias, alias, "duplicate");
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
            canvas.tickers.pause({ id: idShow });
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
             * If true, then the old component is removed with a move out, after the new image is moved in.
             * @default false
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
        oldComponentAlias && canvas.tickers.transfer(oldComponentAlias, alias, "move");
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
            if (removeOldComponentWithMoveOut) {
                const ids = moveOut(
                    oldComponentAlias,
                    { ...props, autoplay: false, completeOnContinue },
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
        const ids = canvas.tickers.pause({ canvasAlias: alias });
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
        canvas.tickers.pause({ canvasAlias: alias });
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
        if (id) {
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
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        let {
            direction = "right",
            completeOnContinue = true,
            tickerIdToResume = [],
            aliasToRemoveAfter = [],
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
        oldComponentAlias && canvas.tickers.transfer(oldComponentAlias, alias, "move");
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
            if (props.removeOldComponentWithZoomOut) {
                const ids = zoomOut(
                    oldComponentAlias,
                    { ...props, autoplay: false, completeOnContinue },
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
        const ids = canvas.tickers.pause({ canvasAlias: alias });
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
        canvas.tickers.pause({ canvasAlias: alias });
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
        oldComponentAlias && canvas.tickers.transfer(oldComponentAlias, alias, "move");
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
        const ids = canvas.tickers.pause({ canvasAlias: alias });
        tickerIdToResume.push(...ids);
        // remove the old component
        if (oldComponentAlias) {
            const ids = pushOut(oldComponentAlias, {
                ...props,
                direction: direction, //== "up" ? "down" : direction == "down" ? "up" : direction == "left" ? "right" : "left",
                completeOnContinue,
            });
            if (ids) {
                res.push(...ids);
            }
        }
        // create the ticker and play it
        const idShow = canvas.animate(
            alias,
            mapDestination(destination) as any,
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
     * boundary. The direction/angle, edge softness, and inversion are all configurable, so the same
     * primitive can produce horizontal, vertical, or diagonal reveals - see {@link WipeInOutProps}.
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
            softness = 0,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
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
        oldComponentAlias && aliasToRemoveAfter.push(oldComponentAlias);
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const config: WipeFilterConfig = {
            kind: "wipe",
            angle: angle ?? directionToAngle(direction),
            softness,
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
        if (id) {
            return [id];
        }
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
            softness = 0,
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
            softness,
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
            softness = 0,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
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
        oldComponentAlias && aliasToRemoveAfter.push(oldComponentAlias);
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const config: IrisFilterConfig = {
            kind: "iris",
            originX: origin.x ?? 0.5,
            originY: origin.y ?? 0.5,
            aspect,
            softness,
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
        if (id) {
            return [id];
        }
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
            softness = 0,
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
        const config: IrisFilterConfig = {
            kind: "iris",
            originX: origin.x ?? 0.5,
            originY: origin.y ?? 0.5,
            aspect,
            softness,
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
     * Show a image in the canvas with a split effect: two mask panels slide together from the edges to
     * progressively reveal the image, meeting at the split line once fully shown. A configured
     * {@link SplitInOutProps} covers "curtain"-like effects without a story-specific API.
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
            origin = 0.5,
            softness = 0,
            invert = false,
            duration,
            delay,
            ease,
            completeOnContinue = true,
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
        oldComponentAlias && aliasToRemoveAfter.push(oldComponentAlias);
        if (
            (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
            newComponent.haveEmptyTexture
        ) {
            await newComponent.load();
        }
        const config: SplitFilterConfig = {
            kind: "split",
            orientation,
            origin,
            softness,
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
        if (id) {
            return [id];
        }
    }

    /**
     * Remove a image from the canvas with a split effect: two mask panels retract apart toward the
     * edges to progressively conceal the image. See {@link splitIn} and {@link SplitInOutProps}.
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
            origin = 0.5,
            softness = 0,
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
            origin,
            softness,
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
        oldComponentAlias && aliasToRemoveAfter.push(oldComponentAlias);
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
        if (id) {
            return [id];
        }
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
            duration,
            delay,
            ease,
            completeOnContinue = true,
            fadeComponent = false,
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
        oldComponentAlias && aliasToRemoveAfter.push(oldComponentAlias);
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
        const filter = new filters.PixelateFilter(pixelSize);
        const id = addMotionFilterEffect(
            alias,
            newComponent,
            filter,
            { sizeX: [pixelSize, 1], sizeY: [pixelSize, 1] },
            { duration: resolvedDuration, delay, ease, completeOnContinue, aliasToRemoveAfter },
            priority,
        );
        if (id) {
            return [id];
        }
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
        const filter = new filters.PixelateFilter(1);
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { sizeX: [1, pixelSize], sizeY: [1, pixelSize] },
            { duration: resolvedDuration, delay, ease, completeOnContinue, aliasToRemoveAfter },
            priority,
        );
        if (id) {
            return [id];
        }
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
            const ids = flashReplace(alias, existingComponent, component, {
                color,
                maxAlpha,
                fadeDuration,
                holdDuration,
                pulses,
                completeOnContinue,
                rest,
                priority,
            });
            if (ids) {
                return ids;
            }
            return;
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
     * Creates the solid-`color` overlay {@link addFlashOverlay}/{@link flashReplace} animate the alpha
     * of: a `Graphics` rect sized and positioned to `target`'s current bounds, layered just above it.
     */
    function createFlashOverlay(
        target: CanvasBaseInterface<any>,
        color: ColorType,
        initialAlpha: number = 0,
    ): string {
        const bounds = target.getBounds();
        const overlay = new PixiContainer();
        const rect = new PIXI.Graphics();
        rect.rect(0, 0, bounds.width, bounds.height).fill(color);
        // `rect` is a plain, ephemeral PIXI.Graphics (not a pixi-vn CanvasBaseItem), so it's added via
        // the underlying PixiJS Container API rather than the stricter pixi-vn-component-only typing.
        (overlay as unknown as PixiJsContainer).addChild(rect);
        overlay.position.set(bounds.x, bounds.y);
        overlay.alpha = initialAlpha;
        const overlayAlias = `${target.label}_flash_${Math.random().toString(36).slice(2)}`;
        canvas.add(overlayAlias, overlay, { zIndex: (target.zIndex ?? 0) + 1 });
        return overlayAlias;
    }

    /**
     * Shared implementation for {@link flashIn} (fresh element)/{@link flashOut}: adds a
     * {@link createFlashOverlay} over `target` and fades its alpha via `canvas.animate`, the exact
     * multi-stop keyframe idiom {@link effects.shakeEffect} already uses - no filter or mask is needed
     * for flash.
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
        const overlayAlias = createFlashOverlay(target, options.color);
        const { values, times, total } = buildFlashKeyframes(
            options.maxAlpha,
            options.fadeDuration,
            options.holdDuration,
            options.pulses,
            options.endAtPeak ?? false,
        );
        const aliasToRemoveAfter = [...options.aliasToRemoveAfter, overlayAlias];
        return canvas.animate(
            overlayAlias,
            { alpha: values },
            {
                ...options.rest,
                duration: total,
                times,
                aliasToRemoveAfter,
                completeOnContinue: options.completeOnContinue,
            } as any,
            options.priority,
        );
    }

    /**
     * Handles {@link flashIn} when `alias` already has a component under it: fades the *current* content
     * up to `color` (the same up-ramp {@link addFlashOverlay} uses, via {@link buildFlashKeyframes}'
     * `endAtPeak`, so it holds at `color` instead of fading back down), then - once the screen is a solid
     * `color` - swaps in the new content and fades a fresh, identically-colored overlay back down to
     * reveal it. Both sides look the same (solid `color`) at the instant of the swap, so the content
     * change itself is invisible; only the color washes through.
     *
     * The swap is scheduled with a plain `setTimeout` matched to the up-ramp's own duration, rather than
     * through an animation-completion callback: `canvas.animate`'s public options deliberately omit
     * `onComplete` (a callback isn't serializable - see `AnimationOptions`). This means a save made mid
     * flash won't perfectly resume the pending swap - the same already-accepted limitation the
     * mask/filter transitions have for their own live, non-persisted state.
     */
    function flashReplace(
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
    ): string[] | undefined {
        const oldOverlayAlias = createFlashOverlay(oldComponent, options.color);
        const { values, times, total } = buildFlashKeyframes(
            options.maxAlpha,
            options.fadeDuration,
            options.holdDuration,
            options.pulses,
            true,
        );
        const upId = canvas.animate(
            oldOverlayAlias,
            { alpha: values },
            { ...options.rest, duration: total, times, completeOnContinue: false } as any,
            options.priority,
        );
        setTimeout(() => {
            void (async () => {
                const { component: newComponent, oldComponentAlias } = swapComponentForEffect(
                    alias,
                    component,
                    "flash",
                );
                // The old content and its now-stale, still-opaque overlay are no longer needed - remove
                // both right away rather than waiting for the down-phase ticker below to complete, since
                // the old overlay's zIndex (old.zIndex + 1) would otherwise sit above the new content and
                // its own fresh overlay, hiding the fade-down entirely.
                canvas.remove(oldComponentAlias ? [oldOverlayAlias, oldComponentAlias] : [oldOverlayAlias]);
                if (
                    (newComponent instanceof ImageSprite || newComponent instanceof ImageContainer) &&
                    newComponent.haveEmptyTexture
                ) {
                    await newComponent.load();
                }
                const newOverlayAlias = createFlashOverlay(newComponent, options.color, options.maxAlpha);
                canvas.animate(
                    newOverlayAlias,
                    { alpha: [options.maxAlpha, 0] },
                    {
                        ...options.rest,
                        duration: options.fadeDuration,
                        aliasToRemoveAfter: [newOverlayAlias],
                        completeOnContinue: options.completeOnContinue,
                    } as any,
                    options.priority,
                );
            })();
        }, total * 1000);
        if (upId) {
            return [upId];
        }
    }
}
