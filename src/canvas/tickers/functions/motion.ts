import type { Ticker as PixiTicker } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import {
    animate as animateMotion,
    AnimationOptions,
    AnimationPlaybackControlsWithThen,
    At,
    ObjectSegment,
    ObjectTarget,
    SequenceOptions,
} from "motion";
import { canvas } from "../..";

type ObjectSegmentWithTransition<O extends {} = {}> = [
    O,
    ObjectTarget<O>,
    AnimationOptions &
        At & {
            ticker?: PixiTicker;
        },
];

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
    if (Array.isArray(arg1) && Array.isArray(arg1[0])) {
        const sequence = arg1.map((segment: any) => {
            const { ticker = new PIXI.Ticker(), ...rest } = segment[2] || {};
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
        const { ticker = new PIXI.Ticker() } = arg3 || {};
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

export default animate;
