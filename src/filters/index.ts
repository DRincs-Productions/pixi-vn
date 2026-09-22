import { GameUnifier } from "@drincs/pixi-vn/core";
import type { AnimationOptions } from "@drincs/pixi-vn/motion";
import {
    AlphaFilter,
    BlurFilter,
    NoiseFilter,
    type Filter,
    type UPDATE_PRIORITY,
} from "@drincs/pixi-vn/pixi.js";
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
 * Animate either a `Filter`'s own properties, or a plain numeric "progress" value with no live target
 * (used by the mask-based transitions - wipe/iris/split - which have no filter property to write
 * directly, just a number and a side effect). See `GameUnifier.animateFilter`'s own doc comment for the
 * full parameter reference; this just forwards to it (through the same DI indirection `canvas`'s own
 * animate methods use - `filters` can't import `motion` directly, since `canvas` already depends on
 * `filters` and `motion` depends on `canvas`, so `filters -> motion` would close a cycle).
 * @param components The canvas element alias(es) the filter is attached to, or otherwise associated
 * with this animation.
 * @param filter The `Filter` instance to animate, or `undefined` to animate a plain value instead.
 * @param keyframes The keyframes to animate the filter's properties (or the plain value) with.
 * @param options The animation options.
 * @param priority The update priority of the ticker.
 * @param apply Called on every frame with the current interpolated value - required when `filter` is
 * `undefined`, ignored otherwise.
 * @param cleanup Called once, right before completion handling, to detach/destroy the filter or tear
 * down whatever `apply` was driving.
 * @returns The id of the ticker, or `undefined` if the ticker was not added.
 */
function animate(
    components: string | string[],
    filter: Filter | undefined,
    keyframes: Record<string, any>,
    options?: AnimationOptions,
    priority?: UPDATE_PRIORITY,
    apply?: (value: number) => void,
    cleanup?: () => void,
): string | undefined {
    return GameUnifier.animateFilter(components, filter, keyframes, options, priority, apply, cleanup);
}

/**
 * Every filter class Pixi'VN registers for save/restore out of the box (see
 * `register-builtin-filters.ts`), grouped in one place so a project can use them without importing
 * from `pixi.js`/`pixi-filters` directly - e.g. `new filters.BloomFilter({...})` - plus
 * {@link animate}. Not every filter `pixi.js`/`pixi-filters` ships is here: a few (`ColorMapFilter`,
 * `SimpleLightmapFilter`, `TiltShiftAxisFilter`, `ColorMatrixFilter`, `DisplacementFilter`, and
 * pixi.js's internal `MaskFilter`/`BlendModeFilter`/`PassthroughFilter`) are deliberately not
 * registered - see that file's doc comment for why. Those are still directly importable from
 * `pixi.js`/`pixi-filters` as usual; they just won't survive a save/restore round-trip unless a project
 * registers its own `toMemory` for them.
 */
export const filters = {
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
    animate,
} as const;
