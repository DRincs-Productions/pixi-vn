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

type Options = AnimationOptions & At;
type ObjectSegmentWithTransition<O extends {} = {}> = [O, ObjectTarget<O>, Options];

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
const motionDriver: (ticker: PixiTicker) => AnimationOptions["driver"] = (ticker) => (update) => {
    const passTimestamp = ({ lastTime }: PixiTicker) => update(lastTime);
    return {
        start: (_keepAlive = true) => {
            console.log("start ticker");
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
    options?: SequenceOptions & { ticker?: PixiTicker; driver: any },
): AnimationPlaybackControlsWithThen;

function animate<T extends {}>(arg1: any, arg2: any, arg3?: any): AnimationPlaybackControlsWithThen {
    if (Array.isArray(arg1) && Array.isArray(arg1[0])) {
        const {
            ticker = new PIXI.Ticker(),
            driver = motionDriver(ticker),
            ...rest
        } = (arg2 as SequenceOptions & { ticker?: PixiTicker; driver: any }) || {};
        return animateMotion(
            arg1 as (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
            {
                driver,
                ...rest,
            } as any,
        );
    } else {
        const { ticker = new PIXI.Ticker(), driver = motionDriver(ticker), ...rest } = arg3 || {};
        return animateMotion(arg1 as T | T[], arg2 as ObjectTarget<T>, { driver, ...rest });
    }
}

/**
 * Create a timeline for running a sequence of functions with transitions. Each function will be called with the provided arguments and will run for the specified duration.
 * @example
 * timeline([
 *     { duration: 10, onComplete: () => console.log("First step completed") },
 *     { duration: 5, onComplete: () => console.log("Second step completed") },
 * ]);
 * @param times
 * @returns
 */
function timeline(times: Options[], options?: SequenceOptions & { ticker?: PixiTicker; driver: any }) {
    const n = { x: 0 };
    // const sequence: ObjectSegmentWithTransition<number>[] = options.map((option, index) => {
    //     return [n, {x: index + 1}, option];
    // });
    const sequence: ObjectSegmentWithTransition<number | MotionValue<number> | { x: number }>[] = [];
    times.forEach((option, index) => {
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
    return animate<number | MotionValue<number> | { x: number }>(sequence, options);
}

export { animate, motionDriver, timeline };
