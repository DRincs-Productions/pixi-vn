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
          filterType: "ReverbFilter";
      } & Omit<ReverbOptions, "context">)
    | ({
          filterType: "FeedbackDelayFilter";
      } & Omit<FeedbackDelayOptions, "context" | "maxDelay">)
    | ({
          filterType: "FreeverbFilter";
      } & Omit<FreeverbOptions, "context">)
    | ({
          filterType: "DelayFilter";
      } & Omit<DelayOptions, "context">)
    | ({
          filterType: "PingPongDelayFilter";
      } & Omit<PingPongDelayOptions, "context">)
    | ({
          filterType: "GateFilter";
      } & Omit<GateOptions, "context">)
    | ({
          filterType: "AutoFilterFilter";
      } & Omit<AutoFilterOptions, "context">)
    | ({
          filterType: "BiquadFilterFilter";
      } & Omit<BiquadFilterOptions, "context">)
    | ({
          filterType: "OnePoleFilterFilter";
      } & Omit<OnePoleFilterOptions, "context">)
    | ({
          filterType: "FeedbackCombFilterFilter";
      } & Omit<FeedbackCombFilterOptions, "context">)
    | ({
          filterType: "CustomFilter";
      } & Omit<FilterOptions, "context">)
    | ({
          filterType: "ChorusFilter";
      } & Omit<ChorusOptions, "context">)
    | ({
          filterType: "PhaserFilter";
      } & Omit<PhaserOptions, "context">)
    | ({
          filterType: "TremoloFilter";
      } & Omit<TremoloOptions, "context">)
    | ({
          filterType: "VibratoFilter";
      } & Omit<VibratoOptions, "context">)
    | ({
          filterType: "CompressorFilter";
      } & Omit<CompressorOptions, "context">)
    | ({
          filterType: "MidSideCompressorFilter";
      } & Omit<MidSideCompressorOptions, "context">)
    | ({
          filterType: "MultibandCompressorFilter";
      } & Omit<MultibandCompressorOptions, "context">)
    | ({
          filterType: "LimiterFilter";
      } & Omit<LimiterOptions, "context">)
    | ({
          filterType: "GreaterThanFilter";
      } & Omit<GreaterThanOptions, "context">)
    | ({
          filterType: "GreaterThanZeroFilter";
      } & Omit<GreaterThanZeroOptions, "context">)
    | ({
          filterType: "DistortionFilter";
      } & Omit<DistortionOptions, "context">)
    | ({
          filterType: "BitCrusherFilter";
      } & Omit<BitCrusherOptions, "context">)
    | ({
          filterType: "Panner3DFilter";
      } & Omit<Panner3DOptions, "context">)
    | ({
          filterType: "AutoPannerFilter";
      } & Omit<AutoPannerOptions, "context">)
    | ({
          filterType: "StereoWidenerFilter";
      } & Omit<StereoWidenerOptions, "context">);
export default SoundFilterMemory;
