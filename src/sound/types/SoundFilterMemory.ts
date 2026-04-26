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
          /** The oscillator type of the LFO (Tone.js {@link AutoFilterOptions.type}). */
          toneType?: AutoFilterOptions["type"];
      } & Omit<AutoFilterOptions, "context" | "type">)
    | ({
          type: "BiquadFilterFilter";
          /** The biquad filter type (Tone.js {@link BiquadFilterOptions.type}). */
          toneType?: BiquadFilterOptions["type"];
      } & Omit<BiquadFilterOptions, "context" | "type">)
    | ({
          type: "OnePoleFilterFilter";
          /** The one-pole filter type (Tone.js {@link OnePoleFilterOptions.type}). */
          toneType?: OnePoleFilterOptions["type"];
      } & Omit<OnePoleFilterOptions, "context" | "type">)
    | ({
          type: "FeedbackCombFilterFilter";
      } & Omit<FeedbackCombFilterOptions, "context">)
    | ({
          type: "CustomFilter";
          /** The biquad filter type (Tone.js {@link FilterOptions.type}). */
          toneType?: FilterOptions["type"];
      } & Omit<FilterOptions, "context" | "type">)
    | ({
          type: "ChorusFilter";
          /** The oscillator type of the LFO (Tone.js {@link ChorusOptions.type}). */
          toneType?: ChorusOptions["type"];
      } & Omit<ChorusOptions, "context" | "type">)
    | ({
          type: "PhaserFilter";
      } & Omit<PhaserOptions, "context">)
    | ({
          type: "TremoloFilter";
          /** The oscillator type of the LFO (Tone.js {@link TremoloOptions.type}). */
          toneType?: TremoloOptions["type"];
      } & Omit<TremoloOptions, "context" | "type">)
    | ({
          type: "VibratoFilter";
          /** The oscillator type of the LFO (Tone.js {@link VibratoOptions.type}). */
          toneType?: VibratoOptions["type"];
      } & Omit<VibratoOptions, "context" | "type">)
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
          /** The oscillator type of the LFO (Tone.js {@link AutoPannerOptions.type}). */
          toneType?: AutoPannerOptions["type"];
      } & Omit<AutoPannerOptions, "context" | "type">)
    | ({
          type: "StereoWidenerFilter";
      } & Omit<StereoWidenerOptions, "context">);
export default SoundFilterMemory;
