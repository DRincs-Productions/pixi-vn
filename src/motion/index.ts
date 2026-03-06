import { RegisteredTickers } from "@drincs/pixi-vn/canvas";
import MotionSequenceTicker from "./components/MotionSequenceTicker";
import MotionTicker from "./components/MotionTicker";

export type {
    default as AnimationOptions,
    AnimationOptionsCommon,
    AnimationSequenceOptions,
    At,
    KeyframesType,
    ObjectSegment,
    ObjectSegmentWithTransition,
    SequenceOptions,
} from "./interfaces/AnimationOptions";
export { default as motion } from "./motion";
export { animate, motionDriver, SegmentOptions } from "./utils";

RegisteredTickers.add(MotionTicker, "motion");
RegisteredTickers.add(MotionSequenceTicker, "motion-sequence");
