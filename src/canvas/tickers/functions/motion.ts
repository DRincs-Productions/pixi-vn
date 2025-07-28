import { animate as animateMotion, AnimationOptions, ObjectTarget } from "motion";
import { ContainerChild, Ticker as PixiTicker } from "pixi.js";
import { canvas } from "../..";

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
export default function animate<T extends ContainerChild>(
    components: T | T[],
    keyframes: ObjectTarget<T>,
    options: AnimationOptions & {
        ticker?: PixiTicker;
    } = {}
) {
    const { ticker = new PixiTicker() } = options;
    return animateMotion(components, keyframes, {
        driver: (update) => {
            const passTimestamp = ({ lastTime }: PixiTicker) => update(lastTime);

            return {
                start: (_keepAlive = true) => {
                    ticker.add(passTimestamp);
                    ticker.start();
                },
                stop: () => ticker.remove(passTimestamp),
                /**
                 * If we're processing this frame we can use the
                 * framelocked timestamp to keep things in sync.
                 */
                now: () => ticker.lastTime,
            };
        },
        ...options,
    });
}
