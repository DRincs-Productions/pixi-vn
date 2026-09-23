import type { AnimationPlaybackControlsWithThen } from "motion";
import type AnimationOptions from "@motion/interfaces/AnimationOptions";
import { animate } from "@motion/utils";
import MotionFilterTickerBase from "./MotionFilterTickerBase";

interface ValueTarget {
    value: number;
}

interface TArgs {
    keyframes: Record<string, any>;
    options: AnimationOptions;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    startState?: object;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    time?: number;
}

/**
 * Twin of {@link MotionTicker}, for a single `motion` `animate()` call against either a `Filter`'s own
 * properties, or a plain numeric value with no live target (see {@link MotionFilterTickerBase} for the
 * two cases `filters.animate` unifies).
 */
export default class MotionFilterTicker extends MotionFilterTickerBase<TArgs> {
    get animation(): AnimationPlaybackControlsWithThen {
        let animation = this._animation;
        if (animation) {
            return animation;
        }
        // See `suppressWritesDuring`'s doc comment: when resuming a transferred ticker
        // (`this._args.time` set, see the hack note above), constructing the animation must not be
        // allowed to write its first keyframe to the real filter (or invoke `apply`) before the `.time`
        // seek below runs.
        const isResuming = typeof this._args.time === "number";
        const build = () => {
            if (this.filter) {
                const proxy = this.createItem();
                return animate(proxy, this._args.keyframes, {
                    ...this._args.options,
                    onComplete: () => this.onComplete(),
                    ticker: this.ticker,
                });
            }
            const target: ValueTarget = { value: 0 };
            return animate(target, this._args.keyframes, {
                ...this._args.options,
                onUpdate: this.createUpdateHandler(target),
                onComplete: () => this.onComplete(),
                ticker: this.ticker,
            });
        };
        animation = isResuming ? this.suppressWritesDuring(build) : build();
        if (isResuming) {
            animation.time = this._args.time as number;
        }
        this._animation = animation;
        return animation;
    }
    alias: string = "motion-filter";
}
