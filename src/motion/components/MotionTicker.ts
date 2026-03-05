import { AnimationPlaybackControlsWithThen, ObjectTarget } from "motion";
import { AnimationOptions, CanvasBaseInterface } from "../../canvas";
import MotionComponentExtension from "../../canvas/tickers/interfaces/MotionComponentExtension";
import motion from "../motion";
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
        animation = motion.animate(proxies, this._args.keyframes, {
            ...this._args.options,
            onComplete: () => this.onComplete(),
            ticker: this.ticker,
        });
        if (this._args.time) {
            animation.time = this._args.time;
        }
        this._animation = animation;
        return animation;
    }
    alias: string = "motion";
}
