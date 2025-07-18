import { animate as animateMotion, AnimationOptions, ObjectTarget } from "motion";
import { ContainerChild, Ticker } from "pixi.js";

export default function animate<T extends ContainerChild>(
    object: T | T[],
    keyframes: ObjectTarget<T>,
    options: AnimationOptions = {}
) {
    return animateMotion(object, keyframes, {
        driver: (update) => {
            const ticker = new Ticker();
            ticker.autoStart = true;

            const passTimestamp = ({ lastTime }: Ticker) => update(lastTime);

            return {
                start: (keepAlive = true) => ticker.add(passTimestamp, keepAlive),
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
