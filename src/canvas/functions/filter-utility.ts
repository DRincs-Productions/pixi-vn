import { filterAreaCenter } from "@canvas/functions/filter-effect-utility";
import { canvas } from "@canvas/index";
import type { CanvasBaseInterface } from "@canvas/interfaces/CanvasBaseInterface";
import { filters } from "@drincs/pixi-vn/filters";
import type { AnimationOptions } from "@drincs/pixi-vn/motion";
import type { Filter, UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { tickers } from "@drincs/pixi-vn/tickers";

/**
 * Internal helpers for the filter-based `transitions` (`canvas-transition.ts`) and `effects`
 * (`canvas-effect.ts`). Not part of the package's public API: a game sets `component.filters` directly.
 */

/** `component.filters` as a plain array - PixiJS allows a single filter, an array, or `null`. */
export function componentFilters(component: CanvasBaseInterface<any>): Filter[] {
    const current = component.filters;
    if (!current) {
        return [];
    }
    return Array.isArray(current) ? [...(current as readonly Filter[])] : [current as unknown as Filter];
}

/** Appends `toAdd` to the component's filters, keeping the ones already there. */
export function attachFilters(component: CanvasBaseInterface<any>, toAdd: Filter[]): void {
    component.filters = [...componentFilters(component), ...toAdd];
}

/** Removes `toRemove` (by identity) from the component's filters, leaving `null` when none are left. */
export function detachFilters(component: CanvasBaseInterface<any>, toRemove: Filter[]): void {
    const remaining = componentFilters(component).filter((f) => !toRemove.includes(f));
    component.filters = remaining.length > 0 ? remaining : null;
}

/**
 * Attaches `filter` to `component.filters` (preserving any filters already there) and drives
 * `keyframes` on the filter's own properties via `filters.animate` (`MotionFilterTicker`,
 * `motion`-backed - see `transitions.blurIn`/`transitions.pixelateIn`), detaching and destroying it
 * once the animation completes - the component is left exactly as it was before the effect.
 */
export function addMotionFilterEffect(
    alias: string,
    component: CanvasBaseInterface<any>,
    filter: Filter,
    keyframes: Record<string, number[]>,
    args: {
        duration?: number;
        delay?: number | ((index: number, total: number) => number);
        ease?: unknown;
        /** Normalized (0-1) keyframe offsets, forwarded to `filters.animate` as-is - see `motion`'s own `times`. */
        times?: number[];
        completeOnContinue?: boolean;
        aliasToRemoveAfter?: string[] | string;
        /** `false` creates the ticker paused, to be resumed by another ticker's `tickerIdToResume`. */
        autoplay?: boolean;
    },
    priority?: UPDATE_PRIORITY,
): string | undefined {
    attachFilters(component, [filter]);
    const id = filters.animate(
        alias,
        filter,
        keyframes,
        {
            duration: args.duration ?? 1,
            delay: args.delay,
            ease: args.ease as AnimationOptions["ease"],
            times: args.times,
            aliasToRemoveAfter: args.aliasToRemoveAfter,
            autoplay: args.autoplay,
        },
        priority,
        undefined,
        () => {
            detachFilters(component, [filter]);
            filter.destroy();
        },
    );
    if (id && (args.completeOnContinue ?? true)) {
        tickers.completeOnStepEnd({ id });
    }
    return id;
}

/**
 * {@link filterAreaCenter} for `component` as it is right now: its current filters (so call it once
 * the effect's own filters are attached) and the renderer's viewport, when there is one.
 */
export function componentFilterCenter(
    component: CanvasBaseInterface<any>,
    origin: { x: number; y: number },
): ReturnType<typeof filterAreaCenter> {
    let viewport: { width: number; height: number } | undefined;
    try {
        viewport = canvas.screen;
    } catch {
        viewport = undefined;
    }
    return filterAreaCenter(component.getBounds(), origin, componentFilters(component), viewport);
}
