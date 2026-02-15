import {
    AnimationPlaybackControlsWithThen,
    ObjectSegment as MotionObjectSegment,
    ObjectSegmentWithTransition as MotionObjectSegmentWithTransition,
} from "motion";
import { UPDATE_PRIORITY } from "pixi.js";
import { animate, CanvasBaseInterface, ObjectSegment, ObjectSegmentWithTransition, SequenceOptions } from "../..";
import { TickerIdType } from "../../types/TickerIdType";
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
    /**
     * @param args The arguments that you want to pass to the ticker.
     * @param options The options of the ticker.
     */
    constructor(
        args: TArgs,
        options?: {
            /**
             * The duration of the ticker in seconds. If is undefined, the step will end only when the animation is finished (if the animation doesn't have a goal to reach then it won't finish). @default undefined
             */
            duration?: number;
            /**
             * The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
             */
            priority?: UPDATE_PRIORITY;
            /**
             * The id of the ticker. This param is used by the system when will ber restoring the tickers from a save. If not provided, a random id will be generated. @default undefined
             */
            id?: string;
            /**
             * The aliases of the canvas elements that are connected to this ticker. This is used by the system to know which canvas elements are connected to this ticker, and to pass them to the fn method. @default []
             */
            canvasElementAliases?: string[];
        },
    ) {
        super(args, options);
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
        this.animation.pause();
        if (this._args.time) {
            this.animation.time = this._args.time;
        }
    }
    animation: AnimationPlaybackControlsWithThen;
    alias: TickerIdType = "motion-sequence";
}
