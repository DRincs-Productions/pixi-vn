import {
    ObjectSegment as MotionObjectSegment,
    ObjectSegmentWithTransition as MotionObjectSegmentWithTransition,
} from "motion";
import { animate, CanvasBaseInterface, ObjectSegment, ObjectSegmentWithTransition, SequenceOptions } from "../..";
import MotionTickerBase from "./MotionTickerBase";

interface TArgs {
    sequence: (ObjectSegment<CanvasBaseInterface<any>> | ObjectSegmentWithTransition<CanvasBaseInterface<any>>)[];
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
    start(id: string) {
        this.tickerId = id;
        let alias = this.canvasElementAliases[0];
        let proxy = this.createItem(alias);
        let sequence: (
            | MotionObjectSegment<CanvasBaseInterface<any>>
            | MotionObjectSegmentWithTransition<CanvasBaseInterface<any>>
        )[] = this._args.sequence.map((segment, index) => {
            return [
                proxy,
                segment[0],
                {
                    ...(segment[1] || {}),
                    ticker: this.ticker,
                    repeat: this._args.options.repeat === null ? Infinity : this._args.options.repeat,
                    onComplete: index === this._args.sequence.length - 1 ? () => this.onComplete() : undefined,
                },
            ];
        });
        this.animation = animate(sequence, {
            ...this._args.options,
            repeat: this._args.options.repeat === null ? Infinity : this._args.options.repeat,
        });
        if (this._args.time) {
            this.animation.time = this._args.time;
        }
    }
}
