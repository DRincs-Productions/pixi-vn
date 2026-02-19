import type { Ticker as PixiTicker } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import {
    animate as animateMotion,
    AnimationOptions,
    AnimationPlaybackControlsWithThen,
    At,
    MotionValue,
    motionValue,
    ObjectSegment,
    ObjectTarget,
    SequenceOptions,
} from "motion";
import { canvas } from "../..";
import { debounce } from "../../../utils/time-utility";

type Options = AnimationOptions &
    At & {
        ticker?: PixiTicker;
    };
type ObjectSegmentWithTransition<O extends {} = {}> = [O, ObjectTarget<O>, Options];

/**
 * Animate a PixiJS component or components using [motion's animate](https://motion.dev/docs/animate) function.
 * This function integrates with the PixiJS ticker to ensure smooth animations.
 *
 * Pixi’VN will **not** keep track of the animation state of this function (This feature is intended for animating PixiJS components used for UI.).
 * If you want Pixi'VN to save the animation state in saves, use the {@link canvas.animate} function instead.
 * @param components - The PixiJS component(s) to animate.
 * @param keyframes - The keyframes to animate the component(s) with.
 * @param options - Additional options for the animation, including duration, easing, and ticker.
 * @returns An animation playback control object that can be used to start, stop, or control the animation.
 * @template T - The type of PixiJS component(s) being animated.
 */
function animate<T extends {}>(
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
 * If you want Pixi'VN to save the animation state in saves, use the {@link canvas.animate} function instead
 *
 * @param sequence An array of segments to animate, where each segment is an array containing:
 * - The PixiJS component to animate.
 * - The keyframes to animate the component with.
 * - An options object that can include animation options and a ticker.
 * @param options Additional options for the sequence, such as duration and repeat count.
 * @returns An animation playback control object that can be used to start, stop, or control the animation.
 * @template T - The type of PixiJS component(s) being animated.
 */
function animate<T extends {}>(
    sequence: (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
    options?: SequenceOptions,
): AnimationPlaybackControlsWithThen;

function animate(arg1: any, arg2: any, arg3?: any): AnimationPlaybackControlsWithThen {
    const { ticker = new PIXI.Ticker(), ...rest } = arg3 || {};
    if (Array.isArray(arg1) && Array.isArray(arg1[0])) {
        const sequence = arg1.map((segment: any) => {
            return [
                segment[0],
                segment[1],
                {
                    driver: (update: any) => {
                        const passTimestamp = ({ lastTime }: PixiTicker) => update(lastTime);
                        return {
                            start: (_keepAlive = true) => {
                                ticker.add(passTimestamp);
                                ticker.start();
                            },
                            stop: () => ticker.remove(passTimestamp),
                            now: () => ticker.lastTime,
                        };
                    },
                    ...rest,
                } as AnimationOptions & At,
            ];
        });
        return animateMotion(sequence, arg2);
    } else {
        return animateMotion(arg1, arg2, {
            driver: (update: any) => {
                const passTimestamp = ({ lastTime }: PixiTicker) => update(lastTime);
                return {
                    start: (_keepAlive = true) => {
                        ticker.add(passTimestamp);
                        ticker.start();
                    },
                    stop: () => ticker.remove(passTimestamp),
                    now: () => ticker.lastTime,
                };
            },
            ...(arg3 || {}),
        });
    }
}

/**
 * Create a timeline for running a sequence of functions with transitions. Each function will be called with the provided arguments and will run for the specified duration.
 * @example
 * timeline([
 *     { duration: 10, onComplete: () => console.log("First step completed") },
 *     { duration: 5, onComplete: () => console.log("Second step completed") },
 * ]);
 * @param options
 * @returns
 */
function timeline(options: Options[]) {
    const n = { x: 0 };
    // const sequence: ObjectSegmentWithTransition<number>[] = options.map((option, index) => {
    //     return [n, {x: index + 1}, option];
    // });
    const sequence: ObjectSegmentWithTransition<number | MotionValue<number> | { x: number }>[] = [];
    options.forEach((option, index) => {
        const { onComplete, ...rest } = option;
        sequence.push([n, { x: index + 1 }, rest]);
        // TODO: onComplete doesn't work in the following cases. So I found this alternative method to handle it.
        // TODO: https://github.com/motiondivision/motion/issues/3563
        if (onComplete) {
            const obj = motionValue(index);
            obj.on("change", debounce(onComplete, 50));
            sequence.push([obj, index + 1, { duration: 0.01 }]);
        }
    });
    return animate<number | MotionValue<number> | { x: number }>(sequence, { duration: 1 });
}

export { animate, timeline };
