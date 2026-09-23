import type { CanvasBaseInterface } from "@drincs/pixi-vn/canvas";
import type { AnimationPlaybackControlsWithThen, ObjectTarget } from "motion";
import type AnimationOptions from "../interfaces/AnimationOptions";
import type MotionComponentExtension from "../interfaces/MotionComponentExtension";
import { animate } from "../utils";
import MotionTickerBase from "./MotionTickerBase";

interface TArgs {
    keyframes: ObjectTarget<CanvasBaseInterface<any>> & MotionComponentExtension;
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

export default class MotionTicker extends MotionTickerBase<TArgs> {
    get animation(): AnimationPlaybackControlsWithThen {
        let animation = this._animation;
        if (animation) {
            return animation;
        }
        const proxies = this.canvasElementAliases.map((alias) => this.createItem(alias));
        // See `suppressWritesDuring`'s doc comment: when resuming a transferred ticker
        // (`this._args.time` set, see the hack note above), constructing the animation must not be
        // allowed to write its first keyframe to the real component before the `.time` seek below runs.
        const isResuming = typeof this._args.time === "number";
        const build = () =>
            animate(proxies, this._args.keyframes, {
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
    alias: string = "motion";
}
