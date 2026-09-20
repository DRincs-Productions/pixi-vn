import type { Filter } from "@drincs/pixi-vn/pixi.js";
import type { AnimationPlaybackControlsWithThen, ObjectTarget } from "motion";
import type AnimationOptions from "@motion/interfaces/AnimationOptions";
import { animate } from "@motion/utils";
import MotionFilterTickerBase from "./MotionFilterTickerBase";

interface TArgs {
    filter: Filter;
    keyframes: ObjectTarget<Filter>;
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
 * Twin of {@link MotionTicker}, for a single `motion` `animate()` call against a `Filter`'s own
 * properties (see {@link MotionFilterTickerBase}) instead of a canvas element's.
 */
export default class MotionFilterTicker extends MotionFilterTickerBase<TArgs> {
    get animation(): AnimationPlaybackControlsWithThen {
        let animation = this._animation;
        if (animation) {
            return animation;
        }
        const proxy = this.createItem();
        // See `suppressWritesDuring`'s doc comment: when resuming a transferred ticker
        // (`this._args.time` set, see the hack note above), constructing the animation must not be
        // allowed to write its first keyframe to the real filter before the `.time` seek below runs.
        const isResuming = typeof this._args.time === "number";
        const build = () =>
            animate(proxy, this._args.keyframes, {
                ...this._args.options,
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
    alias: string = "motion-filter";
}
