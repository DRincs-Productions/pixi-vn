import { BlurFilter } from "@drincs/pixi-vn/pixi.js";
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
import RegisteredFilters from "../decorators/RegisteredFilters";

/** Shorthand for a `PointData`-shaped constructor option, built from a filter's split x/y getters. */
function pt(x: number, y: number) {
    return { x, y };
}

/**
 * Registers `pixi.js` core filters and the `pixi-filters` collection (both peer dependencies) so they
 * can round-trip through save/restore out of the box, without every project having to register them
 * itself. Imported once (for its side effect) from `filters/index.ts`.
 *
 * Not registered, deliberately:
 * - `ColorMapFilter`, `SimpleLightmapFilter` - their constructors require a `Texture`/`TextureSource`
 *   (`colorMap`/`lightMap`), which isn't itself JSON-serializable by this registry. A project using
 *   these can still register them manually with its own `toMemory` (e.g. storing an asset alias/URL and
 *   re-loading the texture on restore).
 * - `TiltShiftAxisFilter` - exposes no getters at all for any of its constructor options (`blur`,
 *   `gradientBlur`, `start`, `end`, `axis` are all write-only), so no `toMemory` could read anything
 *   back. Its subclass `TiltShiftFilter`, which *is* fully readable, is registered instead.
 *
 * A few filters have individual constructor options with no corresponding getter either (noted inline
 * below) - those are simply omitted from `toMemory`'s output, so restoring falls back to that option's
 * own default rather than losing the whole filter.
 */
RegisteredFilters.add(BlurFilter, {
    name: "BlurFilter",
    toMemory: (filter) => ({
        strengthX: filter.strengthX,
        strengthY: filter.strengthY,
        quality: filter.quality,
        repeatEdgePixels: filter.repeatEdgePixels,
    }),
});

RegisteredFilters.add(PixelateFilter, {
    name: "PixelateFilter",
    // `.size` itself returns the raw Float32Array uniform backing it, not a plain, serializable value -
    // read the two numeric axes instead and pass them back in as a plain array, which the constructor
    // (via its `size` setter) accepts directly.
    toMemory: (filter) => [filter.sizeX, filter.sizeY],
});

RegisteredFilters.add(AdjustmentFilter, {
    name: "AdjustmentFilter",
    toMemory: (filter) => ({
        gamma: filter.gamma,
        contrast: filter.contrast,
        saturation: filter.saturation,
        brightness: filter.brightness,
        red: filter.red,
        green: filter.green,
        blue: filter.blue,
        alpha: filter.alpha,
    }),
});

RegisteredFilters.add(AdvancedBloomFilter, {
    name: "AdvancedBloomFilter",
    toMemory: (filter) => ({
        threshold: filter.threshold,
        bloomScale: filter.bloomScale,
        brightness: filter.brightness,
        blur: filter.blur,
        kernels: filter.kernels,
        quality: filter.quality,
        pixelSize: pt(filter.pixelSizeX, filter.pixelSizeY),
    }),
});

RegisteredFilters.add(AsciiFilter, {
    name: "AsciiFilter",
    toMemory: (filter) => ({
        size: filter.size,
        color: filter.color,
        replaceColor: filter.replaceColor,
    }),
});

RegisteredFilters.add(BackdropBlurFilter, {
    name: "BackdropBlurFilter",
    // `kernelSize`/`legacy` are write-only on the underlying pixi.js BlurFilter this extends - not
    // capturable here.
    toMemory: (filter) => ({
        strength: filter.strength,
        quality: filter.quality,
    }),
});

RegisteredFilters.add(BevelFilter, {
    name: "BevelFilter",
    toMemory: (filter) => ({
        rotation: filter.rotation,
        thickness: filter.thickness,
        lightColor: filter.lightColor,
        lightAlpha: filter.lightAlpha,
        shadowColor: filter.shadowColor,
        shadowAlpha: filter.shadowAlpha,
    }),
});

RegisteredFilters.add(BloomFilter, {
    name: "BloomFilter",
    // `quality`/`resolution`/`kernelSize` are write-only - not capturable here.
    toMemory: (filter) => ({
        strength: pt(filter.strengthX, filter.strengthY),
    }),
});

RegisteredFilters.add(BulgePinchFilter, {
    name: "BulgePinchFilter",
    toMemory: (filter) => ({
        center: pt(filter.centerX, filter.centerY),
        radius: filter.radius,
        strength: filter.strength,
    }),
});

RegisteredFilters.add(ColorGradientFilter, {
    name: "ColorGradientFilter",
    toMemory: (filter) => ({
        type: filter.type,
        stops: filter.stops,
        angle: filter.angle,
        alpha: filter.alpha,
        maxColors: filter.maxColors,
        replace: filter.replace,
    }),
});

RegisteredFilters.add(ColorOverlayFilter, {
    name: "ColorOverlayFilter",
    toMemory: (filter) => ({ color: filter.color, alpha: filter.alpha }),
});

RegisteredFilters.add(ColorReplaceFilter, {
    name: "ColorReplaceFilter",
    toMemory: (filter) => ({
        originalColor: filter.originalColor,
        targetColor: filter.targetColor,
        tolerance: filter.tolerance,
    }),
});

RegisteredFilters.add(ConvolutionFilter, {
    name: "ConvolutionFilter",
    toMemory: (filter) => ({
        matrix: filter.matrix,
        width: filter.width,
        height: filter.height,
    }),
});

RegisteredFilters.add(CrossHatchFilter, {
    name: "CrossHatchFilter",
    toMemory: () => ({}),
});

RegisteredFilters.add(CRTFilter, {
    name: "CRTFilter",
    toMemory: (filter) => ({
        curvature: filter.curvature,
        lineWidth: filter.lineWidth,
        lineContrast: filter.lineContrast,
        verticalLine: filter.verticalLine,
        noise: filter.noise,
        noiseSize: filter.noiseSize,
        vignetting: filter.vignetting,
        vignettingAlpha: filter.vignettingAlpha,
        vignettingBlur: filter.vignettingBlur,
        seed: filter.seed,
        time: filter.time,
    }),
});

RegisteredFilters.add(DotFilter, {
    name: "DotFilter",
    toMemory: (filter) => ({
        scale: filter.scale,
        angle: filter.angle,
        grayscale: filter.grayscale,
    }),
});

RegisteredFilters.add(DropShadowFilter, {
    name: "DropShadowFilter",
    // `resolution` is write-only - not capturable here.
    toMemory: (filter) => ({
        offset: pt(filter.offsetX, filter.offsetY),
        color: filter.color,
        alpha: filter.alpha,
        shadowOnly: filter.shadowOnly,
        blur: filter.blur,
        quality: filter.quality,
        kernels: filter.kernels,
        pixelSize: pt(filter.pixelSizeX, filter.pixelSizeY),
    }),
});

RegisteredFilters.add(EmbossFilter, {
    name: "EmbossFilter",
    toMemory: (filter) => filter.strength,
});

RegisteredFilters.add(GlitchFilter, {
    name: "GlitchFilter",
    toMemory: (filter) => ({
        slices: filter.slices,
        offset: filter.offset,
        direction: filter.direction,
        fillMode: filter.fillMode,
        seed: filter.seed,
        average: filter.average,
        minSize: filter.minSize,
        sampleSize: filter.sampleSize,
        red: filter.red,
        green: filter.green,
        blue: filter.blue,
    }),
});

RegisteredFilters.add(GlowFilter, {
    name: "GlowFilter",
    toMemory: (filter) => ({
        distance: filter.distance,
        outerStrength: filter.outerStrength,
        innerStrength: filter.innerStrength,
        color: filter.color,
        alpha: filter.alpha,
        quality: filter.quality,
        knockout: filter.knockout,
    }),
});

RegisteredFilters.add(GodrayFilter, {
    name: "GodrayFilter",
    toMemory: (filter) => ({
        angle: filter.angle,
        parallel: filter.parallel,
        center: pt(filter.centerX, filter.centerY),
        gain: filter.gain,
        lacunarity: filter.lacunarity,
        time: filter.time,
        alpha: filter.alpha,
    }),
});

RegisteredFilters.add(GrayscaleFilter, {
    name: "GrayscaleFilter",
    toMemory: () => ({}),
});

RegisteredFilters.add(HslAdjustmentFilter, {
    name: "HslAdjustmentFilter",
    toMemory: (filter) => ({
        hue: filter.hue,
        saturation: filter.saturation,
        lightness: filter.lightness,
        colorize: filter.colorize,
        alpha: filter.alpha,
    }),
});

RegisteredFilters.add(KawaseBlurFilter, {
    name: "KawaseBlurFilter",
    toMemory: (filter) => ({
        strength: filter.strength,
        quality: filter.quality,
        pixelSize: pt(filter.pixelSizeX, filter.pixelSizeY),
    }),
});

RegisteredFilters.add(MotionBlurFilter, {
    name: "MotionBlurFilter",
    toMemory: (filter) => ({
        velocity: pt(filter.velocityX, filter.velocityY),
        kernelSize: filter.kernelSize,
        offset: filter.offset,
    }),
});

RegisteredFilters.add(MultiColorReplaceFilter, {
    name: "MultiColorReplaceFilter",
    toMemory: (filter) => ({
        replacements: filter.replacements,
        tolerance: filter.tolerance,
    }),
});

RegisteredFilters.add(OldFilmFilter, {
    name: "OldFilmFilter",
    toMemory: (filter) => ({
        sepia: filter.sepia,
        noise: filter.noise,
        noiseSize: filter.noiseSize,
        scratch: filter.scratch,
        scratchDensity: filter.scratchDensity,
        scratchWidth: filter.scratchWidth,
        vignetting: filter.vignetting,
        vignettingAlpha: filter.vignettingAlpha,
        vignettingBlur: filter.vignettingBlur,
        seed: filter.seed,
    }),
});

RegisteredFilters.add(OutlineFilter, {
    name: "OutlineFilter",
    toMemory: (filter) => ({
        thickness: filter.thickness,
        color: filter.color,
        alpha: filter.alpha,
        quality: filter.quality,
        knockout: filter.knockout,
    }),
});

RegisteredFilters.add(RadialBlurFilter, {
    name: "RadialBlurFilter",
    toMemory: (filter) => ({
        angle: filter.angle,
        center: pt(filter.centerX, filter.centerY),
        kernelSize: filter.kernelSize,
        radius: filter.radius,
    }),
});

RegisteredFilters.add(ReflectionFilter, {
    name: "ReflectionFilter",
    toMemory: (filter) => ({
        mirror: filter.mirror,
        boundary: filter.boundary,
        amplitude: filter.amplitude,
        waveLength: filter.waveLength,
        alpha: filter.alpha,
        time: filter.time,
    }),
});

RegisteredFilters.add(RGBSplitFilter, {
    name: "RGBSplitFilter",
    toMemory: (filter) => ({
        red: pt(filter.redX, filter.redY),
        green: pt(filter.greenX, filter.greenY),
        blue: pt(filter.blueX, filter.blueY),
    }),
});

RegisteredFilters.add(ShockwaveFilter, {
    name: "ShockwaveFilter",
    toMemory: (filter) => ({
        center: pt(filter.centerX, filter.centerY),
        speed: filter.speed,
        amplitude: filter.amplitude,
        wavelength: filter.wavelength,
        brightness: filter.brightness,
        radius: filter.radius,
        time: filter.time,
    }),
});

RegisteredFilters.add(SimplexNoiseFilter, {
    name: "SimplexNoiseFilter",
    toMemory: (filter) => ({
        strength: filter.strength,
        noiseScale: filter.noiseScale,
        offsetX: filter.offsetX,
        offsetY: filter.offsetY,
        offsetZ: filter.offsetZ,
        step: filter.step,
    }),
});

RegisteredFilters.add(TiltShiftFilter, {
    name: "TiltShiftFilter",
    toMemory: (filter) => ({
        blur: filter.blur,
        gradientBlur: filter.gradientBlur,
        start: pt(filter.startX, filter.startY),
        end: pt(filter.endX, filter.endY),
    }),
});

RegisteredFilters.add(TwistFilter, {
    name: "TwistFilter",
    // `padding` is write-only - not capturable here.
    toMemory: (filter) => ({
        radius: filter.radius,
        angle: filter.angle,
        offset: pt(filter.offsetX, filter.offsetY),
    }),
});

RegisteredFilters.add(ZoomBlurFilter, {
    name: "ZoomBlurFilter",
    // `maxKernelSize` is write-only - not capturable here.
    toMemory: (filter) => ({
        strength: filter.strength,
        center: pt(filter.centerX, filter.centerY),
        innerRadius: filter.innerRadius,
        radius: filter.radius,
    }),
});
