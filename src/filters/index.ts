import { AlphaFilter, BlurFilter, NoiseFilter } from "@drincs/pixi-vn/pixi.js";
import {
    AdjustmentFilter,
    AdvancedBloomFilter,
    AsciiFilter,
    BackdropBlurFilter,
    BevelFilter,
    BloomFilter,
    BulgePinchFilter,
    ColorGradientFilter,
    ColorOverlayFilter,
    ColorReplaceFilter,
    ConvolutionFilter,
    CRTFilter,
    CrossHatchFilter,
    DotFilter,
    DropShadowFilter,
    EmbossFilter,
    GlitchFilter,
    GlowFilter,
    GodrayFilter,
    GrayscaleFilter,
    HslAdjustmentFilter,
    KawaseBlurFilter,
    MotionBlurFilter,
    MultiColorReplaceFilter,
    OldFilmFilter,
    OutlineFilter,
    PixelateFilter,
    RadialBlurFilter,
    ReflectionFilter,
    RGBSplitFilter,
    ShockwaveFilter,
    SimplexNoiseFilter,
    TiltShiftFilter,
    TwistFilter,
    ZoomBlurFilter,
} from "pixi-filters";

// Registers pixi.js core filters and the pixi-filters collection for save/restore - side effect only,
// see register-builtin-filters.ts's own doc comment.
import "./classes/register-builtin-filters";

export { default as RegisteredFilters, filterDecorator } from "./decorators/RegisteredFilters";
export type { default as FilterMemory } from "./interfaces/FilterMemory";

/**
 * Every filter class Pixi'VN registers for save/restore out of the box (see
 * `register-builtin-filters.ts`), grouped in one place so a project can use them without importing
 * from `pixi.js`/`pixi-filters` directly - e.g. `new Filters.BloomFilter({...})`. Not every filter
 * `pixi.js`/`pixi-filters` ships is here: a few (`ColorMapFilter`, `SimpleLightmapFilter`,
 * `TiltShiftAxisFilter`, `ColorMatrixFilter`, `DisplacementFilter`, and pixi.js's internal
 * `MaskFilter`/`BlendModeFilter`/`PassthroughFilter`) are deliberately not registered - see that
 * file's doc comment for why. Those are still directly importable from `pixi.js`/`pixi-filters` as
 * usual; they just won't survive a save/restore round-trip unless a project registers its own
 * `toMemory` for them.
 */
export const Filters = {
    AlphaFilter,
    BlurFilter,
    NoiseFilter,
    AdjustmentFilter,
    AdvancedBloomFilter,
    AsciiFilter,
    BackdropBlurFilter,
    BevelFilter,
    BloomFilter,
    BulgePinchFilter,
    ColorGradientFilter,
    ColorOverlayFilter,
    ColorReplaceFilter,
    ConvolutionFilter,
    CRTFilter,
    CrossHatchFilter,
    DotFilter,
    DropShadowFilter,
    EmbossFilter,
    GlitchFilter,
    GlowFilter,
    GodrayFilter,
    GrayscaleFilter,
    HslAdjustmentFilter,
    KawaseBlurFilter,
    MotionBlurFilter,
    MultiColorReplaceFilter,
    OldFilmFilter,
    OutlineFilter,
    PixelateFilter,
    RadialBlurFilter,
    ReflectionFilter,
    RGBSplitFilter,
    ShockwaveFilter,
    SimplexNoiseFilter,
    TiltShiftFilter,
    TwistFilter,
    ZoomBlurFilter,
} as const;
