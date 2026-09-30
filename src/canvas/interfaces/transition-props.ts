import type { ColorType } from "@canvas/types/ColorType";
import type { AnimationOptions } from "@drincs/pixi-vn/motion";
import type { PointData } from "@drincs/pixi-vn/pixi.js";

export interface BaseTransitionProps {
    /**
     * If true, the transition will be completed before the next step.
     * For example, if the transition is a dissolve transition, the "alpha" of the texture will be 1 before the next step.
     * @default true
     */
    completeOnContinue?: boolean;
}

/**
 * Shared by every `xIn` transition that can replace an existing component (same alias): whether the
 * replaced component leaves with its own out animation, started together with the new component's in.
 */
export interface OldComponentOutProps {
    /**
     * If true, the component being replaced leaves with the matching out animation (`moveOut`, `wipeOut`,
     * ...), started at the same time as the in animation. If false, it stays untouched under the new
     * component and is removed once the in animation is done.
     * The default depends on the transition: `false` for `moveIn`/`zoomIn`, `true` for the others.
     */
    animateOldComponentOut?: boolean;
}

export interface ShowWithDissolveTransitionProps extends BaseTransitionProps, AnimationOptions {}
export interface ShowWithFadeTransitionProps extends BaseTransitionProps, AnimationOptions {}
export interface MoveInOutProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * The direction of the movement.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
    /**
     * Adds a motion-blur trail along the movement, ramping up mid-move and back to sharp at the end.
     * `true` uses a 40px trail; a number sets the trail length (pixels).
     * @default false
     */
    motionBlur?: boolean | number;
}
export interface ZoomInOutProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * The direction of the zoom effect.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
export interface PushInOutProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * The direction of the push effect.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
    /**
     * Adds a motion-blur trail along the movement, ramping up mid-move and back to sharp at the end.
     * `true` uses a 40px trail; a number sets the trail length (pixels).
     * @default false
     */
    motionBlur?: boolean | number;
}

/**
 * Shared options for the mask-based reveal/conceal transitions ({@link WipeInOutProps},
 * {@link IrisInOutProps}, {@link SplitInOutProps}).
 */
export interface MaskTransitionProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * If true, the effect is inverted: a "reveal" mask conceals instead, and vice versa.
     * @default false
     */
    invert?: boolean;
}
export interface WipeInOutProps extends MaskTransitionProps {
    /**
     * The angle (in degrees) the wipe boundary sweeps towards. `0` is left-to-right, `90` is
     * bottom-to-top, `180` is right-to-left, `270` is top-to-bottom, and any other value produces a
     * diagonal wipe.
     * @default 0
     */
    angle?: number;
    /**
     * A convenience shorthand for {@link angle}: `"right"` (`0`), `"up"` (`90`), `"left"` (`180`),
     * `"down"` (`270`). Ignored if `angle` is also set.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
export interface IrisInOutProps extends MaskTransitionProps {
    /**
     * The origin of the iris, normalized to the component's own bounds (`0` to `1` on each axis).
     * @default { x: 0.5, y: 0.5 }
     */
    origin?: Partial<PointData>;
    /**
     * The aspect ratio (width / height) of the iris shape. `1` (the default) is a circle.
     * @default 1
     */
    aspect?: number;
    /**
     * `"expand"`: the image is seen *through* the circle (`irisIn` grows it, `irisOut` shrinks it).
     * `"contract"`: the image is seen *around* the circle, which is a hole (`irisIn` shrinks it until the
     * whole image is shown, `irisOut` grows it until the image is gone).
     * @default "expand"
     */
    direction?: "expand" | "contract";
}
export interface SplitInOutProps extends MaskTransitionProps {
    /**
     * The axis the two mask panels move apart on/towards.
     * @default "vertical"
     */
    orientation?: "horizontal" | "vertical";
    /**
     * The origin of the split line, normalized to the component's own bounds (`0` to `1` on the axis
     * perpendicular to {@link orientation}).
     * @default 0.5
     */
    origin?: number;
}
export interface FlashInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The overlay color. See {@link ColorType}.
     * @default 0xffffff
     */
    color?: ColorType;
    /**
     * The peak alpha the overlay reaches.
     * @default 1
     */
    maxAlpha?: number;
    /**
     * How long (in seconds) the overlay stays at {@link maxAlpha} before fading again.
     * @default 0
     */
    holdDuration?: number;
    /**
     * The number of times the overlay fades in and out.
     * @default 1
     */
    pulses?: number;
    /**
     * Whether the component itself also briefly fades in (`flashIn`) or out (`flashOut`) alongside the
     * color flash, softening what would otherwise be an instant pop-in/pop-out - the fade runs at a
     * quarter of the flash's own duration, mirrored to the start of `flashIn`'s cycle or the end of
     * `flashOut`'s. Ignored when `flashIn` replaces an existing component (both sides are already
     * hidden under a solid `color` at the moment of the swap, so there's no pop to soften).
     * @default true
     */
    fadeComponent?: boolean;
}
export interface BlurInOutProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * The blur strength the effect starts from (`blurIn`) or ends at (`blurOut`).
     * @default 32
     */
    strength?: number;
    /**
     * The quality (number of blur passes) of the blur filter. Higher is smoother but slower.
     * @default 4
     */
    quality?: number;
    /**
     * Whether the component itself also briefly fades in (`blurIn`) or out (`blurOut`) alongside the
     * blur, softening what would otherwise be an instant pop-in/pop-out - the fade runs at a quarter of
     * the effect's own duration, mirrored to the start of `blurIn` or the end of `blurOut`.
     * @default true
     */
    fadeComponent?: boolean;
}
export interface PixelateInOutProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * The pixel size the effect starts from (`pixelateIn`) or ends at (`pixelateOut`).
     * @default 32
     */
    pixelSize?: number;
    /**
     * The direction the pixel blocks drift as their size changes. Applies to both entering and
     * exiting components, including the old component during a replacement.
     * `"up-left"` moves from bottom-right towards top-left; the other values mirror either axis.
     * @default "up-left"
     */
    direction?: "up-left" | "up-right" | "down-left" | "down-right";
    /**
     * Whether the component itself also briefly fades in (`pixelateIn`) or out (`pixelateOut`) alongside
     * the pixelation, softening what would otherwise be an instant pop-in/pop-out - the fade runs at a
     * quarter of the effect's own duration, mirrored to the start of `pixelateIn` or the end of
     * `pixelateOut`. Off by default: pixelation itself already reads as a deliberate, blocky
     * appear/disappear, so a softening fade is less often wanted here than for blur/flash.
     * @default false
     */
    fadeComponent?: boolean;
}

/**
 * Shared options for the filter-based reveal/conceal transitions ({@link GlitchInOutProps},
 * {@link TwistInOutProps}, {@link WarpInOutProps}, {@link RippleInOutProps},
 * {@link NoiseDissolveInOutProps}, {@link PinchInOutProps}).
 */
export interface FilterFadeTransitionProps
    extends BaseTransitionProps,
        OldComponentOutProps,
        AnimationOptions {
    /**
     * Whether the component itself also fades in (`xIn`) or out (`xOut`) alongside the filter effect,
     * at a quarter of the effect's own duration, mirrored to the start of `xIn` or the end of `xOut`
     * (same behavior as {@link BlurInOutProps.fadeComponent}). The default depends on the transition.
     */
    fadeComponent?: boolean;
}
export interface GlitchInOutProps extends FilterFadeTransitionProps {
    /**
     * The peak slice-displacement (pixels) - the first burst of `glitchIn`, the last of `glitchOut`.
     * @default 40
     */
    strength?: number;
    /**
     * The number of glitch bursts.
     * @default 3
     */
    bursts?: number;
    /**
     * The number of glitch slices.
     * @default 8
     */
    slices?: number;
    /**
     * The peak red/blue channel separation (pixels) layered on top of the slices, following the same
     * envelope. `0` disables it.
     * @default 6
     */
    rgbSplit?: number;
}
export interface TwistInOutProps extends FilterFadeTransitionProps {
    /**
     * How far (degrees) the swirl is wound up - where `twistIn` starts and `twistOut` ends.
     * @default 540
     */
    angle?: number;
    /**
     * The radius (pixels) of the swirl. Defaults to half the component's diagonal, so the whole
     * component swirls.
     */
    radius?: number;
    /**
     * The center of the swirl, normalized to the component's own bounds (`0` to `1` on each axis).
     * @default { x: 0.5, y: 0.5 }
     */
    origin?: Partial<PointData>;
}
export interface WarpInOutProps extends FilterFadeTransitionProps {
    /**
     * The zoom-blur strength `warpIn` starts from and `warpOut` ends at.
     * @default 0.6
     */
    strength?: number;
    /**
     * The point the streaks radiate from, normalized to the component's own bounds.
     * @default { x: 0.5, y: 0.5 }
     */
    origin?: Partial<PointData>;
}
export interface RippleInOutProps extends FilterFadeTransitionProps {
    /**
     * The point the ripple starts from, normalized to the component's own bounds.
     * @default { x: 0.5, y: 0.5 }
     */
    origin?: Partial<PointData>;
    /**
     * The amplitude of the ripple.
     * @default 30
     */
    amplitude?: number;
    /**
     * The wavelength of the ripple.
     * @default 160
     */
    wavelength?: number;
    /**
     * The speed (pixels-per-second, in the ripple's own time) the ring travels outward. The ring always
     * travels until it has left the component; `speed` only shapes the ring.
     * @default 500
     */
    speed?: number;
}
export interface NoiseDissolveInOutProps extends FilterFadeTransitionProps {
    /**
     * `"hard"`: the component appears/disappears in crisp noise-shaped blotches. `"soft"`: a cloudy,
     * gradual dissolve.
     * @default "hard"
     */
    edge?: "hard" | "soft";
    /**
     * The scale of the noise pattern - higher values give smaller, more numerous blotches.
     * @default 8
     */
    noiseScale?: number;
    /**
     * Picks the noise pattern. Random by default, so every dissolve looks different.
     */
    seed?: number;
}
export interface TvInOutProps extends BaseTransitionProps, OldComponentOutProps, AnimationOptions {
    /**
     * The height of the collapsed bright line, as a fraction of the component's own height.
     * @default 0.02
     */
    lineThickness?: number;
    /**
     * How bright the collapsed line glows (`1` = no change).
     * @default 3
     */
    brightness?: number;
    /**
     * Whether CRT scanlines/noise are shown during the transition.
     * @default true
     */
    scanlines?: boolean;
}
export interface PinchInOutProps extends FilterFadeTransitionProps {
    /**
     * How strong the deformation is, from `0` to `1` - where `pinchIn` starts and `pinchOut` ends.
     * @default 1
     */
    strength?: number;
    /**
     * `"pinch"`: sucked into/out of a point. `"bulge"`: puffed out from/into a point.
     * @default "pinch"
     */
    mode?: "pinch" | "bulge";
    /**
     * The radius (pixels) of the deformation. Defaults to half the component's diagonal.
     */
    radius?: number;
    /**
     * The center of the deformation, normalized to the component's own bounds.
     * @default { x: 0.5, y: 0.5 }
     */
    origin?: Partial<PointData>;
}
