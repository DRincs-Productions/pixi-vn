import type { CanvasBaseInterface, CommonTickerProps } from "@drincs/pixi-vn/canvas";
import {
    At,
    type AnimationOptions as MotionAnimationOptions,
    type SequenceOptions as MotionSequenceOptions,
    type ObjectTarget,
} from "motion";
import type MotionComponentExtension from "./MotionComponentExtension";

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
export type SequenceOptions = MotionSequenceOptions &
    Omit<CommonTickerProps, "startOnlyIfHaveTexture">;
export type ObjectSegment<O extends CanvasBaseInterface<any>> = [
    ObjectTarget<O> & MotionComponentExtension,
];
export type ObjectSegmentWithTransition<O extends CanvasBaseInterface<any>> = [
    ObjectTarget<O> & MotionComponentExtension,
    AnimationOptions & At,
];
