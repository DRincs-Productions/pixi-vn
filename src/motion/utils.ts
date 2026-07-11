import type { Ticker as PixiTicker } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import {
    animate as animateMotion,
    type AnimationOptions,
    type AnimationPlaybackControlsWithThen,
    type At,
    type ObjectSegment,
    type ObjectTarget,
    type SequenceOptions,
} from "motion";

export type SegmentOptions = AnimationOptions & At;
type ObjectSegmentWithTransition<O extends {} = {}> = [O, ObjectTarget<O>, SegmentOptions];

/**
 * Create a motion driver that integrates with the PixiJS ticker. This driver will allow you to use motion's animation capabilities while ensuring that animations are synchronized with the PixiJS rendering loop.
 * @param ticker - The PixiJS ticker to integrate with. If not provided, a new ticker will be created.
 * @returns An object that implements the motion driver interface, allowing you to start, stop, and control animations using the PixiJS ticker.
 * @example
 * const ticker = new PIXI.Ticker();
 * const driver = motionDriver(ticker);
 * const animation = animate(mySprite, { x: 100 }, { duration: 1, driver });
 * animation.start();
 */
export const motionDriver: (ticker: PixiTicker) => AnimationOptions["driver"] =
    (ticker) => (update) => {
        const passTimestamp = ({ lastTime }: PixiTicker) => update(lastTime);
        return {
            start: (_keepAlive = true) => {
                ticker.add(passTimestamp);
                ticker.start();
            },
            stop: () => ticker.remove(passTimestamp),
            now: () => ticker.lastTime,
        };
    };

/**
 * Animate a PixiJS component or components using [motion's animate](https://motion.dev/docs/animate) function.
 * This function integrates with the PixiJS ticker to ensure smooth animations.
 *
 * Pixi’VN will **not** keep track of the animation state of this function (This feature is intended for animating PixiJS components used for UI.).
 * @param components - The PixiJS component(s) to animate.
 * @param keyframes - The keyframes to animate the component(s) with.
 * @param options - Additional options for the animation, including duration, easing, and ticker.
 * @returns An animation playback control object that can be used to start, stop, or control the animation.
 * @template T - The type of PixiJS component(s) being animated.
 */
export function animate<T extends {}>(
    components: T | T[],
    keyframes: ObjectTarget<T>,
    options?: AnimationOptions & { ticker?: PixiTicker },
): AnimationPlaybackControlsWithThen;
/**
 * Animate a sequence of PixiJS components with transitions using [motion's animate](https://motion.dev/docs/animate) function.
 * This function allows for complex animations involving multiple components and transitions.
 * It integrates with the PixiJS ticker to ensure smooth animations.
 * This function is intended for animating PixiJS components used for UI.
 *
 * Pixi’VN will **not** keep track of the animation state of this function (This feature is intended for animating PixiJS components used for UI.).
 *
 * @param sequence An array of segments to animate, where each segment is an array containing:
 * - The PixiJS component to animate.
 * - The keyframes to animate the component with.
 * - An options object that can include animation options and a ticker.
 * @param options Additional options for the sequence, such as duration and repeat count.
 * @returns An animation playback control object that can be used to start, stop, or control the animation.
 * @template T - The type of PixiJS component(s) being animated.
 */
export function animate<T extends {}>(
    sequence: (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
    options?: SequenceOptions & { ticker?: PixiTicker; driver?: any },
): AnimationPlaybackControlsWithThen;

export function animate<T extends {}>(
    arg1: any,
    arg2: any,
    arg3?: any,
): AnimationPlaybackControlsWithThen {
    if (Array.isArray(arg1) && Array.isArray(arg1[0])) {
        if (arg2 && "repeat" in arg2 && arg2?.repeat === null) arg2.repeat = Infinity;
        arg1.forEach((segment) => {
            if (Array.isArray(segment) && segment.length === 3) {
                const [_, __, options] = segment as ObjectSegmentWithTransition<T>;
                if (options && "repeat" in options && options?.repeat === null)
                    options.repeat = Infinity;
            }
        });
        const {
            ticker = new PIXI.Ticker(),
            driver = motionDriver(ticker),
            ...rest
        } = (arg2 as SequenceOptions & { ticker?: PixiTicker; driver?: any }) || {};
        return animateMotion(
            arg1 as (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
            {
                driver,
                ...rest,
            } as any,
        );
    } else {
        if (arg3 && "repeat" in arg3 && arg3?.repeat === null) arg3.repeat = Infinity;
        const { ticker = new PIXI.Ticker(), driver = motionDriver(ticker), ...rest } = arg3 || {};
        return animateMotion(arg1 as T | T[], arg2 as ObjectTarget<T>, { driver, ...rest });
    }
}

/**
 * Create a timeline for running a sequence of functions with transitions. Each function will be called with the provided arguments and will run for the specified duration.
 *
 * `onPlay`/`onComplete` are driven by a PixiJS-ticker-based scheduler rather than motion's own
 * per-segment callbacks: motion's array/sequence syntax doesn't reliably call `onPlay`/`onComplete`
 * once per segment when the timeline repeats (https://github.com/motiondivision/motion/issues/3563),
 * since the previous workaround (a throwaway `MotionValue` per segment, "change"-debounced into the
 * callback) got reset and replayed by motion's own `repeat` handling, firing extra times per loop.
 * This scheduler only supports segments placed sequentially (via `duration`/`delay`); the `at` label
 * positioning of motion's `At` type is passed through to the underlying visual tween but is not
 * accounted for when timing these callbacks.
 * @example
 * timeline([
 *     { duration: 10, onComplete: () => console.log("First step completed") },
 *     { duration: 5, onComplete: () => console.log("Second step completed") },
 * ]);
 * @param times
 * @param options
 * @returns
 */
export function timeline(
    times: SegmentOptions[],
    options?: SequenceOptions & { ticker?: PixiTicker; driver?: any },
): AnimationPlaybackControlsWithThen {
    const { ticker = new PIXI.Ticker(), driver = motionDriver(ticker), repeat, ...rest } =
        options || {};

    const n = { x: 0 };
    const steps: {
        start: number;
        end: number;
        onPlay?: () => void;
        onComplete?: () => void;
    }[] = [];
    const sequence: ObjectSegmentWithTransition<number | { x: number }>[] = [];

    let cursor = 0;
    times.forEach((time, index) => {
        const { onComplete, onPlay, delay = 0, duration = 0.3, ...rest2 } = time;
        // `delay` can be a per-target DynamicOption(index, total) for staggering across multiple
        // subjects; each of our segments only ever targets the single shared `n` subject, so it
        // always resolves against a single-element group.
        const resolvedDelay = typeof delay === "function" ? delay(0, 1) : delay;
        const start = cursor + resolvedDelay;
        const end = start + duration;
        steps.push({ start, end, onPlay, onComplete });
        sequence.push([n, { x: index + 1 }, { ...rest2, delay, duration }]);
        cursor = end;
    });
    const totalDuration = cursor;

    const animation = animate<number | { x: number }>(sequence, {
        ...rest,
        repeat,
        driver,
    } as SequenceOptions & { driver: any });

    if (steps.length > 0 && totalDuration > 0) {
        const normalizedRepeat = repeat === null ? Infinity : repeat;
        const maxCycles = normalizedRepeat === undefined ? 1 : normalizedRepeat + 1;
        let activeIndex = -1;
        let cyclesCompleted = 0;
        let elapsed = 0;
        let finished = false;

        const enterStep = (index: number) => {
            if (activeIndex >= 0) steps[activeIndex].onComplete?.();
            activeIndex = index;
            steps[activeIndex].onPlay?.();
        };
        const finishActiveStep = () => {
            if (activeIndex >= 0) steps[activeIndex].onComplete?.();
            activeIndex = -1;
        };
        // Returns the index of the step active at `position`, or -1 if `position` falls in a
        // gap before a step's (delayed) start, where no step should be considered active yet.
        const stepIndexAt = (position: number) => {
            for (let i = 0; i < steps.length; i++) {
                if (position < steps[i].start) return -1;
                if (position < steps[i].end) return i;
            }
            return steps.length - 1;
        };
        const stopWatching = () => {
            finished = true;
            ticker.remove(onTick);
        };

        function onTick() {
            if (finished) return;
            elapsed += ticker.deltaMS / 1000;

            while (!finished && elapsed >= totalDuration) {
                finishActiveStep();
                cyclesCompleted++;
                if (cyclesCompleted >= maxCycles) {
                    stopWatching();
                    return;
                }
                elapsed -= totalDuration;
            }
            const index = stepIndexAt(elapsed);
            if (index === -1) {
                if (activeIndex >= 0) finishActiveStep();
            } else if (index !== activeIndex) {
                enterStep(index);
            }
        }
        ticker.add(onTick);

        const stopAnimation = animation.stop.bind(animation);
        animation.stop = () => {
            stopWatching();
            stopAnimation();
        };
    }

    return animation;
}
