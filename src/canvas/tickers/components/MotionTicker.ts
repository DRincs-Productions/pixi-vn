import { AnimationPlaybackControlsWithThen, ObjectTarget } from "motion";
import { animate, AnimationOptions, CanvasBaseInterface } from "../..";
import { TickerIdType } from "../../types/TickerIdType";
import MotionComponentExtension from "../interfaces/MotionComponentExtension";
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
        let proxies = this.canvasElementAliases.map((alias) => this.createItem(alias));
        animation = animate(proxies, this._args.keyframes, {
            ...this._args.options,
            repeat: this._args.options?.repeat === null ? Infinity : this._args.options?.repeat,
            onComplete: () => this.onComplete(),
            ticker: this.ticker,
        });
        if (this._args.time) {
            animation.time = this._args.time;
        }
        this._animation = animation;
        return animation;
    }
    alias: TickerIdType = "motion";
}
