import type { CanvasBaseInterface } from "@drincs/pixi-vn/canvas";
import type { Filter, UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { tickers } from "@drincs/pixi-vn/tickers";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
import MotionFilterTicker from "./components/MotionFilterTicker";
import MotionSequenceTicker from "./components/MotionSequenceTicker";
import MotionTicker from "./components/MotionTicker";
import type AnimationOptions from "./interfaces/AnimationOptions";
import type {
    KeyframesType,
    ObjectSegment,
    ObjectSegmentWithTransition,
    SequenceOptions,
} from "./interfaces/AnimationOptions";

namespace motion {
    /**
     * Animate a canvas element.
     * @param components The canvas element(s) or their alias(es) to animate.
     * @param keyframes The keyframes to animate to.
     * @param options The animation options.
     * @param priority The update priority of the ticker.
     * @returns The id of the ticker, or `undefined` if the ticker was not added.
     * @throws {PixiError} when `keyframes` or `options` contain functions or class instances that cannot be serialized to JSON.
     */
    export function animate<T extends CanvasBaseInterface<any>>(
        components: T | string | (string | T)[],
        keyframes: KeyframesType<T>,
        options?: AnimationOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined;
    /**
     * Animate a canvas element using a sequence.
     * @param components The canvas element(s) or their alias(es) to animate.
     * @param sequence The sequence of animation segments.
     * @param options The sequence options.
     * @param priority The update priority of the ticker.
     * @returns The id of the ticker, or `undefined` if the ticker was not added.
     * @throws {PixiError} when `sequence` or `options` contain functions or class instances that cannot be serialized to JSON.
     */
    export function animate<T extends CanvasBaseInterface<any>>(
        components: T | string,
        sequence: (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
        options?: SequenceOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined;
    export function animate<T extends CanvasBaseInterface<any>>(
        components: T | string | (string | T)[],
        keyframes: KeyframesType<T> | (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
        options?: AnimationOptions | SequenceOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined {
        try {
            keyframes = createExportableElement(keyframes);
        } catch (e) {
            logger.error("animate keyframes cannot contain functions or classes");
            throw e;
        }
        try {
            options = createExportableElement(options);
        } catch (e) {
            logger.error("animate options cannot contain functions or classes");
            throw e;
        }
        let aliases: string[] = [];
        if (typeof components === "string") {
            aliases = [components];
        } else if (Array.isArray(components)) {
            aliases = components.map((c) => (typeof c === "string" ? c : c.label));
        } else {
            aliases = [components.label];
        }
        let ticker: MotionSequenceTicker | MotionTicker;
        if (Array.isArray(keyframes)) {
            ticker = new MotionSequenceTicker(
                {
                    sequence: keyframes as (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
                    options: options as SequenceOptions,
                },
                {
                    priority: priority,
                    canvasElementAliases: aliases,
                },
            );
        } else {
            ticker = new MotionTicker(
                {
                    keyframes: keyframes as KeyframesType<T>,
                    options: options as AnimationOptions,
                },
                {
                    priority: priority,
                    canvasElementAliases: aliases,
                },
            );
        }
        const id = tickers.add<any>(aliases, ticker);
        const { completeOnContinue } = options || {};
        if (id && completeOnContinue) {
            tickers.completeOnStepEnd({
                id: id,
            });
        }
        return id;
    }

    /**
     * Animate either a `Filter`'s own properties, or a plain numeric "progress" value with no live
     * target (as opposed to {@link animate}, which animates a canvas element's properties) - see
     * {@link MotionFilterTicker}. The latter is the generic mechanism behind the mask-based transitions
     * (`wipeIn`/`wipeOut`, `irisIn`/`irisOut`, `splitIn`/`splitOut`): they have no canvas element or
     * Filter property to write directly, just a number and a side effect (redrawing mask geometry).
     * @param components The canvas element alias(es) the filter is attached to, or otherwise associated
     * with this animation (kept for the same cleanup/transfer bookkeeping every other ticker
     * participates in).
     * @param filter The `Filter` instance to animate, or `undefined` to animate a plain value instead
     * (in which case `keyframes` describes that value, e.g. `{ value: [0, 1] }`, and `apply` is required).
     * @param keyframes The keyframes to animate the filter's properties (or the plain value) with.
     * @param options The animation options.
     * @param priority The update priority of the ticker.
     * @param apply Called on every frame with the current interpolated value - required when `filter` is
     * `undefined`, ignored otherwise (the filter's own properties are written to directly instead).
     * @param cleanup Called once, right before completion handling, to detach/destroy the filter or tear
     * down whatever `apply` was driving.
     * @returns The id of the ticker, or `undefined` if the ticker was not added.
     */
    export function animateFilter(
        components: string | string[],
        filter: Filter | undefined,
        keyframes: Record<string, any>,
        options?: AnimationOptions,
        priority?: UPDATE_PRIORITY,
        apply?: (value: number) => void,
        cleanup?: () => void,
    ): string | undefined {
        try {
            keyframes = createExportableElement(keyframes);
        } catch (e) {
            logger.error("animateFilter keyframes cannot contain functions or classes");
            throw e;
        }
        try {
            options = createExportableElement(options);
        } catch (e) {
            logger.error("animateFilter options cannot contain functions or classes");
            throw e;
        }
        const aliases = Array.isArray(components) ? components : [components];
        const ticker = new MotionFilterTicker(
            { keyframes, options: options as AnimationOptions },
            { filter, apply, priority, canvasElementAliases: aliases, cleanup },
        );
        const id = tickers.add<any>(aliases, ticker);
        const { completeOnContinue } = options || {};
        if (id && completeOnContinue) {
            tickers.completeOnStepEnd({
                id: id,
            });
        }
        return id;
    }
}
export default motion;
