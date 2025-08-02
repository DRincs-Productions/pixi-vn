import { AnimationOptions as MotionAnimationOptions, ObjectTarget } from "motion";
import { CommonTickerProps } from "../tickers";
import MotionComponentExtension from "../tickers/interfaces/MotionComponentExtension";

type AnimationOptions = Omit<MotionAnimationOptions, "onComplete" | "onPlay" | "onStop" | "onUpdate" | "onRepeat"> &
    Omit<CommonTickerProps, "startOnlyIfHaveTexture">;
export default AnimationOptions;
export type KeyframesType<T> = ObjectTarget<T> & MotionComponentExtension;
