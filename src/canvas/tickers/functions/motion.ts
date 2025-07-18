import { animate as animateMotion, AnimationOptions, ObjectTarget } from "motion";
import { ContainerChild, Ticker } from "pixi.js";

export default function animate<T extends ContainerChild>(
    components: T | T[] | string | string[],
    keyframes: ObjectTarget<T>,
    options: AnimationOptions = {}
) {
    const ticker = new Ticker();
    animateMotion(components, keyframes, {
        driver: (update) => {
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
    return ticker;
}
