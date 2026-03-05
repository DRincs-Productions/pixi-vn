import { RegisteredTickers } from "@drincs/pixi-vn/canvas";
import MotionSequenceTicker from "./components/MotionSequenceTicker";
import MotionTicker from "./components/MotionTicker";

export { animate, motionDriver, SegmentOptions, timeline } from "./utils";

RegisteredTickers.add(MotionTicker, "motion");
RegisteredTickers.add(MotionSequenceTicker, "motion-sequence");
