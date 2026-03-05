import { RegisteredTickers } from "@drincs/pixi-vn/canvas";
import MotionSequenceTicker from "./components/MotionSequenceTicker";
import MotionTicker from "./components/MotionTicker";

export { default as motion, SegmentOptions } from "./motion";
export { motionDriver } from "./utils";

RegisteredTickers.add(MotionTicker, "motion");
RegisteredTickers.add(MotionSequenceTicker, "motion-sequence");
