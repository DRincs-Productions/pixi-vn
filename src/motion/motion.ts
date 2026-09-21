import type { CanvasBaseInterface } from "@drincs/pixi-vn/canvas";
import { canvas } from "@drincs/pixi-vn/canvas";
import type { Filter, UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
import MotionFilterTicker from "./components/MotionFilterTicker";
import MotionSequenceTicker from "./components/MotionSequenceTicker";
import MotionTicker from "./components/MotionTicker";
import MotionValueTicker from "./components/MotionValueTicker";
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
        const id = canvas.tickers.add<any>(aliases, ticker);
        const { completeOnContinue } = options || {};
        if (id && completeOnContinue) {
            canvas.tickers.completeOnStepEnd({
                id: id,
            });
        }
        return id;
    }

    /**
     * Animate a `Filter`'s own properties (as opposed to {@link animate}, which animates a canvas
     * element's properties) - see {@link MotionFilterTicker}.
     * @param components The canvas element alias(es) the filter is attached to.
     * @param filter The `Filter` instance to animate.
     * @param keyframes The keyframes to animate the filter's properties with.
     * @param options The animation options.
     * @param priority The update priority of the ticker.
     * @param cleanup Called once, right before completion handling, to detach/destroy the filter.
     * @returns The id of the ticker, or `undefined` if the ticker was not added.
     */
    export function animateFilter(
        components: string | string[],
        filter: Filter,
        keyframes: Record<string, any>,
        options?: AnimationOptions,
        priority?: UPDATE_PRIORITY,
        cleanup?: (filter: Filter) => void,
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
            { filter, priority, canvasElementAliases: aliases, cleanup },
        );
        const id = canvas.tickers.add<any>(aliases, ticker);
        const { completeOnContinue } = options || {};
        if (id && completeOnContinue) {
            canvas.tickers.completeOnStepEnd({
                id: id,
            });
        }
        return id;
    }

    /**
     * Animate a plain numeric "progress" value (as opposed to {@link animate}, which animates a canvas
     * element's properties, or {@link animateFilter}, a `Filter`'s) - see {@link MotionValueTicker}. The
     * generic mechanism behind the mask-based transitions (`wipeIn`/`wipeOut`, `irisIn`/`irisOut`,
     * `splitIn`/`splitOut`): they have no canvas element or Filter property to write directly, just a
     * number and a side effect (redrawing mask geometry).
     * @param components The canvas element alias(es) associated with this animation (kept for the same
     * cleanup/transfer bookkeeping every other ticker participates in - `apply` decides what to do with
     * the animated value, independently of these).
     * @param keyframes The keyframes to animate the value with, e.g. `{ value: [0, 1] }`.
     * @param options The animation options.
     * @param priority The update priority of the ticker.
     * @param apply Called on every frame with the current interpolated value.
     * @param cleanup Called once, right before completion handling.
     * @returns The id of the ticker, or `undefined` if the ticker was not added.
     */
    export function animateValue(
        components: string | string[],
        keyframes: Record<string, any>,
        options?: AnimationOptions,
        priority?: UPDATE_PRIORITY,
        apply?: (value: number) => void,
        cleanup?: () => void,
    ): string | undefined {
        try {
            keyframes = createExportableElement(keyframes);
        } catch (e) {
            logger.error("animateValue keyframes cannot contain functions or classes");
            throw e;
        }
        try {
            options = createExportableElement(options);
        } catch (e) {
            logger.error("animateValue options cannot contain functions or classes");
            throw e;
        }
        const aliases = Array.isArray(components) ? components : [components];
        const ticker = new MotionValueTicker(
            { keyframes, options: options as AnimationOptions },
            { apply, priority, canvasElementAliases: aliases, cleanup },
        );
        const id = canvas.tickers.add<any>(aliases, ticker);
        const { completeOnContinue } = options || {};
        if (id && completeOnContinue) {
            canvas.tickers.completeOnStepEnd({
                id: id,
            });
        }
        return id;
    }
}
export default motion;
