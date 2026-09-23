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

export interface ShowWithDissolveTransitionProps extends BaseTransitionProps, AnimationOptions {}
export interface ShowWithFadeTransitionProps extends BaseTransitionProps, AnimationOptions {}
export interface MoveInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The direction of the movement.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
export interface ZoomInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The direction of the zoom effect.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
export interface PushInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The direction of the push effect.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}

/**
 * Shared options for the mask-based reveal/conceal transitions ({@link WipeInOutProps},
 * {@link IrisInOutProps}, {@link SplitInOutProps}).
 */
export interface MaskTransitionProps extends BaseTransitionProps, AnimationOptions {
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
export interface BlurInOutProps extends BaseTransitionProps, AnimationOptions {
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
export interface PixelateInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The pixel size the effect starts from (`pixelateIn`) or ends at (`pixelateOut`).
     * @default 32
     */
    pixelSize?: number;
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
