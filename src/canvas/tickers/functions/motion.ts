import { animate as animateMotion, AnimationOptions, ObjectTarget } from "motion";
import { ContainerChild, Ticker as PixiTicker } from "pixi.js";

export default function animate<T extends ContainerChild>(
    components: T | T[] | string | string[],
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
