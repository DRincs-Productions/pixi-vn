import { ObjectTarget } from "motion";
import { animate, AnimationOptions, CanvasBaseInterface } from "../..";
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
    start(id: string): void {
        this.tickerId = id;
        let proxies = this.canvasElementAliases.map(this.createItem);
        this.animation = animate(proxies, this._args.keyframes, {
            ...this._args.options,
            repeat: this._args.options.repeat === null ? Infinity : this._args.options.repeat,
            onComplete: this.onComplete,
            ticker: this.ticker,
        });
        if (this._args.time) {
            this.animation.time = this._args.time;
        }
    }
}
