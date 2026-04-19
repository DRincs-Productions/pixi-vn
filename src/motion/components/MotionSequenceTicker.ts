import type { CanvasBaseInterface } from "@drincs/pixi-vn/canvas";
import type {
    AnimationPlaybackControlsWithThen,
    ObjectSegment as MotionObjectSegment,
    ObjectSegmentWithTransition as MotionObjectSegmentWithTransition,
} from "motion";
import type {
    ObjectSegment,
    ObjectSegmentWithTransition,
    SequenceOptions,
} from "../interfaces/AnimationOptions";
import { animate } from "../utils";
import MotionTickerBase from "./MotionTickerBase";

interface TArgs {
    sequence: (
        | ObjectSegment<CanvasBaseInterface<any>>
        | ObjectSegmentWithTransition<CanvasBaseInterface<any>>
    )[];
    options: SequenceOptions;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    startState?: object;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    time?: number;
}

export default class MotionSequenceTicker extends MotionTickerBase<TArgs> {
    get animation(): AnimationPlaybackControlsWithThen {
        let animation = this._animation;
        if (animation) {
            return animation;
        }
        const alias = this.canvasElementAliases[0];
        const proxy = this.createItem(alias);
        const sequence: (
            | MotionObjectSegment<CanvasBaseInterface<any>>
            | MotionObjectSegmentWithTransition<CanvasBaseInterface<any>>
        )[] = this._args.sequence.map((segment, index) => {
            return [
                proxy,
                segment[0],
                {
                    ...(segment[1] || {}),
                    ticker: this.ticker,
                    onComplete:
                        index === this._args.sequence.length - 1
                            ? () => this.onComplete()
                            : undefined,
                },
            ];
        });
        animation = animate(sequence, this._args.options);
        if (this._args.time) {
            this.animation.time = this._args.time;
        }
        this._animation = animation;
        return animation;
    }
    alias: string = "motion-sequence";
}
