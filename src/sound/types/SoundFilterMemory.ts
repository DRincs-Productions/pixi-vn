import type {
    AutoFilterOptions,
    AutoPannerOptions,
    BiquadFilterOptions,
    BitCrusherOptions,
    ChorusOptions,
    CompressorOptions,
    DelayOptions,
    DistortionOptions,
    FeedbackCombFilterOptions,
    FeedbackDelayOptions,
    FilterOptions,
    FreeverbOptions,
    GateOptions,
    GreaterThanOptions,
    GreaterThanZeroOptions,
    LimiterOptions,
    MidSideCompressorOptions,
    MultibandCompressorOptions,
    OnePoleFilterOptions,
    Panner3DOptions,
    PhaserOptions,
    PingPongDelayOptions,
    ReverbOptions,
    StereoWidenerOptions,
    TremoloOptions,
    VibratoOptions,
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
      } & Omit<GateOptions, "context">)
    | ({
          type: "AutoFilterFilter";
      } & Omit<AutoFilterOptions, "context">)
    | ({
          type: "BiquadFilterFilter";
      } & Omit<BiquadFilterOptions, "context">)
    | ({
          type: "OnePoleFilterFilter";
      } & Omit<OnePoleFilterOptions, "context">)
    | ({
          type: "FeedbackCombFilterFilter";
      } & Omit<FeedbackCombFilterOptions, "context">)
    | ({
          type: "CustomFilter";
      } & Omit<FilterOptions, "context">)
    | ({
          type: "ChorusFilter";
      } & Omit<ChorusOptions, "context">)
    | ({
          type: "PhaserFilter";
      } & Omit<PhaserOptions, "context">)
    | ({
          type: "TremoloFilter";
      } & Omit<TremoloOptions, "context">)
    | ({
          type: "VibratoFilter";
      } & Omit<VibratoOptions, "context">)
    | ({
          type: "CompressorFilter";
      } & Omit<CompressorOptions, "context">)
    | ({
          type: "MidSideCompressorFilter";
      } & Omit<MidSideCompressorOptions, "context">)
    | ({
          type: "MultibandCompressorFilter";
      } & Omit<MultibandCompressorOptions, "context">)
    | ({
          type: "LimiterFilter";
      } & Omit<LimiterOptions, "context">)
    | ({
          type: "GreaterThanFilter";
      } & Omit<GreaterThanOptions, "context">)
    | ({
          type: "GreaterThanZeroFilter";
      } & Omit<GreaterThanZeroOptions, "context">)
    | ({
          type: "DistortionFilter";
      } & Omit<DistortionOptions, "context">)
    | ({
          type: "BitCrusherFilter";
      } & Omit<BitCrusherOptions, "context">)
    | ({
          type: "Panner3DFilter";
      } & Omit<Panner3DOptions, "context">)
    | ({
          type: "AutoPannerFilter";
      } & Omit<AutoPannerOptions, "context">)
    | ({
          type: "StereoWidenerFilter";
      } & Omit<StereoWidenerOptions, "context">);
export default SoundFilterMemory;
