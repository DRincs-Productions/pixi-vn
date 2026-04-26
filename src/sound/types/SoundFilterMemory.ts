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
      } & Omit<Partial<ReverbOptions>, "context">)
    | ({
          filterType: "FeedbackDelayFilter";
      } & Omit<Partial<FeedbackDelayOptions>, "context">)
    | ({
          filterType: "FreeverbFilter";
      } & Omit<Partial<FreeverbOptions>, "context">)
    | ({
          filterType: "DelayFilter";
      } & Omit<Partial<DelayOptions>, "context">)
    | ({
          filterType: "PingPongDelayFilter";
      } & Omit<Partial<PingPongDelayOptions>, "context">)
    | ({
          filterType: "GateFilter";
      } & Omit<Partial<GateOptions>, "context">)
    | ({
          filterType: "AutoFilterFilter";
      } & Omit<Partial<AutoFilterOptions>, "context">)
    | ({
          filterType: "BiquadFilterFilter";
      } & Omit<Partial<BiquadFilterOptions>, "context">)
    | ({
          filterType: "OnePoleFilterFilter";
      } & Omit<Partial<OnePoleFilterOptions>, "context">)
    | ({
          filterType: "FeedbackCombFilterFilter";
      } & Omit<Partial<FeedbackCombFilterOptions>, "context">)
    | ({
          filterType: "CustomFilter";
      } & Omit<Partial<FilterOptions>, "context">)
    | ({
          filterType: "ChorusFilter";
      } & Omit<Partial<ChorusOptions>, "context">)
    | ({
          filterType: "PhaserFilter";
      } & Omit<Partial<PhaserOptions>, "context">)
    | ({
          filterType: "TremoloFilter";
      } & Omit<Partial<TremoloOptions>, "context">)
    | ({
          filterType: "VibratoFilter";
      } & Omit<Partial<VibratoOptions>, "context">)
    | ({
          filterType: "CompressorFilter";
      } & Omit<Partial<CompressorOptions>, "context">)
    | ({
          filterType: "MidSideCompressorFilter";
      } & Omit<Partial<MidSideCompressorOptions>, "context">)
    | ({
          filterType: "MultibandCompressorFilter";
      } & Omit<Partial<MultibandCompressorOptions>, "context">)
    | ({
          filterType: "LimiterFilter";
      } & Omit<Partial<LimiterOptions>, "context">)
    | ({
          filterType: "GreaterThanFilter";
      } & Omit<Partial<GreaterThanOptions>, "context">)
    | ({
          filterType: "GreaterThanZeroFilter";
      } & Omit<Partial<GreaterThanZeroOptions>, "context">)
    | ({
          filterType: "DistortionFilter";
      } & Omit<Partial<DistortionOptions>, "context">)
    | ({
          filterType: "BitCrusherFilter";
      } & Omit<Partial<BitCrusherOptions>, "context">)
    | ({
          filterType: "Panner3DFilter";
      } & Omit<Partial<Panner3DOptions>, "context">)
    | ({
          filterType: "AutoPannerFilter";
      } & Omit<Partial<AutoPannerOptions>, "context">)
    | ({
          filterType: "StereoWidenerFilter";
      } & Omit<Partial<StereoWidenerOptions>, "context">);
export default SoundFilterMemory;
