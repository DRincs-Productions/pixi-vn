import type { FeedbackDelayOptions, ReverbOptions } from "tone";

type SoundFilterMemory =
    | ({
          type: "ReverbFilter";
      } & Omit<ReverbOptions, "context">)
    | ({
          type: "FeedbackDelayFilter";
      } & Omit<FeedbackDelayOptions, "context" | "maxDelay">);
export default SoundFilterMemory;
