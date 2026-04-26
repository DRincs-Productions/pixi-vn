import type { FeedbackDelayOptions, ReverbOptions } from "tone";

type ReverbFilter = {
    type: "ReverbFilter";
} & Omit<ReverbOptions, "context">;
type FeedbackDelayFilter = {
    type: "FeedbackDelayFilter";
} & Omit<FeedbackDelayOptions, "context">;

type SoundFilterMemory = ReverbFilter | FeedbackDelayFilter;
export default SoundFilterMemory;
