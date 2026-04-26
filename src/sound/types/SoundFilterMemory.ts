import type {
    DelayOptions,
    FeedbackDelayOptions,
    FreeverbOptions,
    GateOptions,
    PingPongDelayOptions,
    ReverbOptions,
} from "tone";

type SoundFilterMemory =
    | ({
          type: "ReverbFilter";
      } & Omit<ReverbOptions, "context">)
    | ({
          type: "FeedbackDelayFilter";
      } & Omit<FeedbackDelayOptions, "context" | "maxDelay">)
    | ({
          type: "FreeverbFilter";
      } & Omit<FreeverbOptions, "context">)
    | ({
          type: "DelayFilter";
      } & Omit<DelayOptions, "context">)
    | ({
          type: "PingPongDelayFilter";
      } & Omit<PingPongDelayOptions, "context">)
    | ({
          type: "GateFilter";
      } & Omit<GateOptions, "context">);
export default SoundFilterMemory;
