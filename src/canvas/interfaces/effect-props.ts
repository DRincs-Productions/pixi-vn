import type { AnimationOptions } from "@drincs/pixi-vn/motion";
import type { BaseTransitionProps } from "./transition-props";

export interface ShakeEffectProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The number of shocks. **Must be at least 3**.
     * @default 10
     */
    shocksNumber?: number;
    /**
     * The type of the shake effect
     * @default "horizontal"
     */
    shakeType?: "horizontal" | "vertical";
    /**
     * The maximum size of the shock.
     * For horizontal type, it is the maximum size of the x axis.
     * For vertical type, it is the maximum size of the y axis.
     * @default 10
     */
    maxShockSize?: number;
}

/**
 * Shared options for the generic, repeated articulated-animation effects ({@link BounceEffectProps},
 * {@link HopEffectProps}, {@link WiggleEffectProps}, {@link NodEffectProps}, {@link SwayEffectProps}):
 * a number of cycles, each one shrinking towards rest by {@link decay}.
 */
export interface DecayingEffectProps extends BaseTransitionProps, AnimationOptions {
    /**
     * How much each successive cycle shrinks relative to the previous one (`1` = no decay/constant
     * amplitude, `0` = the second cycle onward has no amplitude at all).
     * @default 0.5
     */
    decay?: number;
}

export interface BounceEffectProps extends DecayingEffectProps {
    /**
     * The direction the component displaces towards on each bounce, before returning to rest.
     * @default "up"
     */
    direction?: "up" | "down" | "left" | "right";
    /**
     * The distance (in pixels) of the first, largest bounce.
     * @default 30
     */
    distance?: number;
    /**
     * The number of bounces.
     * @default 4
     */
    bounces?: number;
}

export interface PulseEffectProps extends DecayingEffectProps {
    /**
     * The peak scale multiplier of the first, largest pulse (relative to the component's current
     * scale) - e.g. `1.2` grows the component 20% bigger at the peak of the first pulse.
     * @default 1.2
     */
    scale?: number;
    /**
     * The number of pulses.
     * @default 3
     */
    pulses?: number;
}

export interface HopEffectProps extends DecayingEffectProps {
    /**
     * The direction of the (primary and any secondary) hops.
     * @default "up"
     */
    direction?: "up" | "down" | "left" | "right";
    /**
     * The distance (in pixels) of the primary hop.
     * @default 40
     */
    distance?: number;
    /**
     * The number of smaller, decaying hops to play after the primary one (`0` = just the one hop).
     * @default 0
     */
    secondaryHops?: number;
}

export interface WiggleEffectProps extends DecayingEffectProps {
    /**
     * The peak rotation (in degrees) away from the component's current angle, on the first repetition.
     * @default 15
     */
    angle?: number;
    /**
     * The number of repetitions.
     * @default 3
     */
    repetitions?: number;
}

export interface NodEffectProps extends DecayingEffectProps {
    /**
     * The axis the component oscillates along.
     * @default "horizontal"
     */
    axis?: "horizontal" | "vertical";
    /**
     * The distance (in pixels) of the first, largest oscillation.
     * @default 15
     */
    distance?: number;
    /**
     * The number of repetitions.
     * @default 3
     */
    repetitions?: number;
}

export interface SwayEffectProps extends DecayingEffectProps {
    /**
     * The distance (in pixels) of the positional drift, on the first repetition.
     * @default 10
     */
    distance?: number;
    /**
     * The rotational drift (in degrees) away from the component's current angle, on the first
     * repetition.
     * @default 5
     */
    angle?: number;
    /**
     * The axis the positional drift moves along.
     * @default "horizontal"
     */
    axis?: "horizontal" | "vertical";
    /**
     * The number of repetitions.
     * @default 3
     */
    repetitions?: number;
}

export interface PunchEffectProps extends BaseTransitionProps, AnimationOptions {
    /**
     * Which property the punch animates.
     * @default "scale"
     */
    mode?: "x" | "y" | "rotation" | "scale";
    /**
     * The strength of the punch's attack - a pixel distance for `x`/`y`, degrees for `rotation`, or a
     * scale multiplier delta for `scale` (e.g. `0.3` peaks at 1.3x the current scale).
     * @default 0.3
     */
    strength?: number;
    /**
     * How far the recovery overshoots past rest, in the opposite direction, as a fraction of
     * {@link strength} (`0` = no overshoot, settles straight back to rest).
     * @default 0.3
     */
    overshoot?: number;
}

export interface GlitchEffectProps extends DecayingEffectProps {
    /**
     * The peak slice-displacement amount (pixels) of the first, largest burst.
     * @default 30
     */
    strength?: number;
    /**
     * The number of glitch bursts.
     * @default 3
     */
    bursts?: number;
    /**
     * The number of glitch slices.
     * @default 5
     */
    slices?: number;
    /**
     * The angle (in degrees) slices are displaced along.
     * @default 0
     */
    direction?: number;
}

export interface ChromaticAberrationEffectProps extends DecayingEffectProps {
    /**
     * The peak red/blue channel pixel offset of the first, largest burst (channels split in opposite
     * directions, green stays centered).
     * @default 8
     */
    strength?: number;
    /**
     * The axis the channels split along.
     * @default "horizontal"
     */
    axis?: "horizontal" | "vertical";
    /**
     * The number of bursts.
     * @default 1
     */
    bursts?: number;
}

export interface ShockwaveEffectProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The origin of the ripple, normalized (0-1) to the element's own bounds.
     * @default {x: 0.5, y: 0.5}
     */
    origin?: { x: number; y: number };
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
     * The brightness of the ripple.
     * @default 1
     */
    brightness?: number;
    /**
     * The maximum radius (in pixels) the ripple travels before fading out. A value `<= 0` means the
     * ripple travels an infinite distance.
     * @default -1
     */
    radius?: number;
    /**
     * The speed (in pixels-per-second) the ripple travels outward.
     * @default 500
     */
    speed?: number;
    /**
     * How far the ripple's own internal "time" advances by the end of the animation - the effect
     * settles once this exceeds the ripple's own travel time, so the default is derived from
     * {@link radius}/{@link speed} (or `1` when {@link radius} is infinite).
     */
    strength?: number;
}

export interface RadialBlurEffectProps extends DecayingEffectProps {
    /**
     * The peak zoom-blur strength of the first, largest burst.
     * @default 0.5
     */
    strength?: number;
    /**
     * The number of bursts.
     * @default 1
     */
    bursts?: number;
    /**
     * The origin the blur radiates from, normalized (0-1) to the element's own bounds.
     * @default {x: 0.5, y: 0.5}
     */
    origin?: { x: number; y: number };
    /**
     * The inner radius (in pixels) excluded from the blur.
     * @default 0
     */
    innerRadius?: number;
    /**
     * The outer radius (in pixels) of the blur. A value `< 0` means the blur extends infinitely.
     * @default -1
     */
    radius?: number;
}

export interface BlurPulseEffectProps extends DecayingEffectProps {
    /**
     * The peak blur strength of the first, largest pulse.
     * @default 8
     */
    strength?: number;
    /**
     * The number of pulses.
     * @default 3
     */
    pulses?: number;
    /**
     * The blur filter's own render quality (number of blur passes). Higher looks smoother but costs
     * more to render.
     * @default 4
     */
    quality?: number;
}

export interface VignettePulseEffectProps extends DecayingEffectProps {
    /**
     * The peak vignette opacity of the first, largest pulse.
     * @default 1
     */
    strength?: number;
    /**
     * The number of pulses.
     * @default 1
     */
    pulses?: number;
    /**
     * The radius of the vignette - smaller values produce a smaller (more closed-in) vignette.
     * @default 0.3
     */
    radius?: number;
    /**
     * The blur intensity of the vignette's edge.
     * @default 0.3
     */
    blur?: number;
}

export interface DesaturateEffectProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The saturation floor reached at the trough (`0` = full grayscale, `1` = no desaturation at all).
     * @default 0
     */
    amount?: number;
    /**
     * How long the component stays at {@link amount} before recovering back to normal saturation, on
     * top of the fade in/out (each {@link AnimationOptions.duration}).
     * @default 0
     */
    holdDuration?: number;
}

export interface GlowPulseEffectProps extends DecayingEffectProps {
    /**
     * The peak outward glow strength of the first, largest pulse.
     * @default 4
     */
    strength?: number;
    /**
     * The number of pulses.
     * @default 3
     */
    pulses?: number;
    /**
     * The color of the glow.
     * @default 0xffffff
     */
    color?: number;
    /**
     * The distance (in pixels) the glow extends.
     * @default 10
     */
    distance?: number;
    /**
     * The strength of the glow inward from the edge of the component.
     * @default 0
     */
    innerStrength?: number;
}
