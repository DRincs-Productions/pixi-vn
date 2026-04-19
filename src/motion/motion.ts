import type { CanvasBaseInterface } from "@drincs/pixi-vn/canvas";
import { canvas } from "@drincs/pixi-vn/canvas";
import type { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
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
        const id = canvas.addTicker<any>(aliases, ticker);
        const { forceCompleteBeforeNext } = options || {};
        const { completeOnContinue = forceCompleteBeforeNext } = options || {};
        if (id && completeOnContinue) {
            canvas.completeTickerOnStepEnd({
                id: id,
            });
        }
        return id;
    }
}
export default motion;
