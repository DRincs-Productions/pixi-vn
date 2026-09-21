import type { AnimationPlaybackControlsWithThen, ObjectTarget } from "motion";
import type AnimationOptions from "@motion/interfaces/AnimationOptions";
import { animate } from "@motion/utils";
import MotionValueTickerBase from "./MotionValueTickerBase";

interface ValueTarget {
    value: number;
}

interface TArgs {
    keyframes: ObjectTarget<ValueTarget>;
    options: AnimationOptions;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    time?: number;
}

/**
 * Twin of {@link MotionFilterTicker}, for a single `motion` `animate()` call against a private plain
 * `{ value: number }` target (see {@link MotionValueTickerBase}) instead of a Filter's properties.
 */
export default class MotionValueTicker extends MotionValueTickerBase<TArgs> {
    get animation(): AnimationPlaybackControlsWithThen {
        let animation = this._animation;
        if (animation) {
            return animation;
        }
        const target: ValueTarget = { value: 0 };
        // See `suppressWritesDuring`'s doc comment: when resuming a transferred ticker
        // (`this._args.time` set, see the hack note above), constructing the animation must not be
        // allowed to invoke `apply` with the first keyframe's value before the `.time` seek below runs.
        const isResuming = typeof this._args.time === "number";
        const build = () =>
            animate(target, this._args.keyframes, {
                ...this._args.options,
                onUpdate: this.createUpdateHandler(),
                onComplete: () => this.onComplete(),
                ticker: this.ticker,
            });
        animation = isResuming ? this.suppressWritesDuring(build) : build();
        if (isResuming) {
            animation.time = this._args.time as number;
        }
        this._animation = animation;
        return animation;
    }
    alias: string = "motion-value";
}
