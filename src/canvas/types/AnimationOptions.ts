import { AnimationOptions as MotionAnimationOptions } from "motion";
import { CommonTickerProps } from "../tickers";

type AnimationOptions = Omit<MotionAnimationOptions, "onComplete" | "onPlay" | "onStop" | "onUpdate" | "onRepeat"> &
    CommonTickerProps;
export default AnimationOptions;
