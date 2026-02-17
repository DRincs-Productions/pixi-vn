import {
    At,
    AnimationOptions as MotionAnimationOptions,
    SequenceOptions as MotionSequenceOptions,
    ObjectTarget,
} from "motion";
import { CanvasBaseInterface } from "../interfaces/CanvasBaseInterface";
import { CommonTickerProps } from "../tickers";
import MotionComponentExtension from "../tickers/interfaces/MotionComponentExtension";

export type AnimationOptionsCommon = Omit<
    MotionAnimationOptions,
    "onComplete" | "onPlay" | "onStop" | "onUpdate" | "onRepeat"
>;
export { At };
type AnimationOptions = AnimationOptionsCommon & Omit<CommonTickerProps, "startOnlyIfHaveTexture">;
export default AnimationOptions;
export type KeyframesType<T> = ObjectTarget<T> & MotionComponentExtension;
export type AnimationSequenceOptions = Omit<
    MotionAnimationOptions,
    "onComplete" | "onPlay" | "onStop" | "onUpdate" | "onRepeat"
>;
export type SequenceOptions = MotionSequenceOptions & Omit<CommonTickerProps, "startOnlyIfHaveTexture">;
export type ObjectSegment<O extends CanvasBaseInterface<any>> = [ObjectTarget<O>];
export type ObjectSegmentWithTransition<O extends CanvasBaseInterface<any>> = [ObjectTarget<O>, AnimationOptions & At];
