import {
    buildGlitchJitter,
    shockwaveTravel,
    zoomBlurPadding,
} from "@tickers/utility/filter-effect-utility";
import { addMotionFilterEffect, componentFilterCenter } from "@canvas/functions/filter-utility";
import { canvas } from "@canvas/index";
import type {
    BlurPulseEffectProps,
    BounceEffectProps,
    ChromaticAberrationEffectProps,
    DesaturateEffectProps,
    GlitchEffectProps,
    GlowPulseEffectProps,
    HopEffectProps,
    NodEffectProps,
    PulseEffectProps,
    PunchEffectProps,
    RadialBlurEffectProps,
    ShakeEffectProps,
    ShockwaveEffectProps,
    SwayEffectProps,
    VignettePulseEffectProps,
    WiggleEffectProps,
} from "@canvas/interfaces/effect-props";
import { filters } from "@drincs/pixi-vn/filters";
import type { Filter, UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { logger } from "@utils/log-utility";

/**
 * @deprecated Use `effects.shakeEffect` instead.
 */
export async function shakeEffect(
    alias: string,
    options: ShakeEffectProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    return effects.shakeEffect(alias, options, priority);
}

/**
 * Maps the `direction` shorthand shared by {@link BounceEffectProps}/{@link HopEffectProps} to the
 * axis it displaces along, and the sign of that displacement.
 */
function directionToAxisSign(direction: "up" | "down" | "left" | "right"): {
    axis: "x" | "y";
    sign: 1 | -1;
} {
    switch (direction) {
        case "up":
            return { axis: "y", sign: -1 };
        case "down":
            return { axis: "y", sign: 1 };
        case "left":
            return { axis: "x", sign: -1 };
        default:
            return { axis: "x", sign: 1 };
    }
}

/**
 * Builds a `[0, ±peak, 0, ±peak*decay, 0, ±peak*decay^2, 0, ...]`-shaped array of `cycles` oscillations
 * around `0`, alternating sign, each one shrinking towards `0` by `decay` relative to the previous one -
 * the shared shape behind {@link effects.wiggleEffect}/{@link effects.nodEffect}/{@link effects.swayEffect}.
 * The caller adds its own rest value to every entry.
 */
function buildDecayingOscillation(peak: number, decay: number, cycles: number): number[] {
    const values: number[] = [0];
    let amplitude = peak;
    for (let i = 0; i < cycles; i++) {
        values.push(i % 2 === 0 ? amplitude : -amplitude, 0);
        amplitude *= decay;
    }
    return values;
}

/**
 * Builds a `[rest, rest+peakDelta, rest, rest+peakDelta*decay, rest, ...]`-shaped array of `cycles`
 * one-directional pulses always returning through `rest`, each one shrinking towards `rest` by `decay`
 * relative to the previous one - the shape behind every filter-driven pulse/burst effect below (their
 * filter property's own "rest" is `0` = no effect, unlike a component's position/scale).
 */
function buildDecayingPulses(
    rest: number,
    peakDelta: number,
    decay: number,
    cycles: number,
): number[] {
    const values: number[] = [rest];
    let delta = peakDelta;
    for (let i = 0; i < cycles; i++) {
        values.push(rest + delta, rest);
        delta *= decay;
    }
    return values;
}

export namespace effects {
    /**
     * Shake the canvas element.
     * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
     * @param alias The alias to identify the component.
     * @param options Animation options, matching the `options` of animate function.
     * @param priority The priority of the PixiJS ticker. This parameter sets the ticker's priority.
     * @returns
     */
    export async function shakeEffect(
        alias: string,
        options: ShakeEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const elemet = canvas.find(alias);
        if (!elemet) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the shake effect can't be applied.`,
            );
            return;
        }
        const position = { x: elemet.position.x, y: elemet.position.y };
        const {
            shakeType = "horizontal",
            maxShockSize = 10,
            shocksNumber: shocksNumberTemp = 10,
            ...rest
        } = options;
        const shocksNumber = shocksNumberTemp - 1;
        if (shocksNumber < 2) {
            logger.error("The number of shocks must be at least 3.");
            return;
        }
        const upshocksNumber = Math.floor(shocksNumber / 2);
        const downshocksNumber = Math.ceil(shocksNumber / 2);

        const array: number[] = [];
        for (let i = 0; i < upshocksNumber; i++) {
            const shockSize = (maxShockSize * (i + 1)) / upshocksNumber;
            if (shakeType === "horizontal") {
                if (i % 2 !== 0) {
                    array.push(position.x + shockSize);
                } else {
                    array.push(position.x - shockSize);
                }
            } else {
                if (i % 2 !== 0) {
                    array.push(position.y + shockSize);
                } else {
                    array.push(position.y - shockSize);
                }
            }
        }
        const lastItemIsLeft = upshocksNumber % 2 === 0;
        for (let i = downshocksNumber; i > 0; i--) {
            const shockSize = (maxShockSize * (i + 1)) / (downshocksNumber - 1);
            if (shakeType === "horizontal") {
                if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
                    array.push(position.x - shockSize);
                } else {
                    array.push(position.x + shockSize);
                }
            } else {
                if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
                    array.push(position.y - shockSize);
                } else {
                    array.push(position.y + shockSize);
                }
            }
        }

        let id: string | undefined;
        if (shakeType === "horizontal") {
            array.push(position.x);
            id = canvas.animate(alias, { x: array }, rest, priority);
        } else {
            array.push(position.y);
            id = canvas.animate(alias, { y: array }, rest, priority);
        }
        if (id) {
            return [id];
        }
    }

    /**
     * Bounce the canvas element: a one-directional displacement that repeatedly returns to rest, each
     * bounce shrinking towards rest by {@link BounceEffectProps.decay}. Like a dropped ball settling.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function bounceEffect(
        alias: string,
        options: BounceEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the bounce effect can't be applied.`,
            );
            return;
        }
        const { direction = "up", distance = 30, bounces = 4, decay = 0.5, ...rest } = options;
        const { axis, sign } = directionToAxisSign(direction);
        const restValue = axis === "x" ? component.position.x : component.position.y;
        const array: number[] = [restValue];
        let peak = distance;
        for (let i = 0; i < bounces; i++) {
            array.push(restValue + sign * peak, restValue);
            peak *= decay;
        }
        const id = canvas.animate(alias, { [axis]: array }, rest, priority);
        if (id) {
            return [id];
        }
    }

    /**
     * Pulse the canvas element: a repeated, decaying scale bump away from its current scale and back.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function pulseEffect(
        alias: string,
        options: PulseEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the pulse effect can't be applied.`,
            );
            return;
        }
        const { scale = 1.2, pulses = 3, decay = 0.6, ...rest } = options;
        const restScaleX = component.scale.x;
        const restScaleY = component.scale.y;
        const arrayX: number[] = [restScaleX];
        const arrayY: number[] = [restScaleY];
        let bump = scale - 1;
        for (let i = 0; i < pulses; i++) {
            arrayX.push(restScaleX * (1 + bump), restScaleX);
            arrayY.push(restScaleY * (1 + bump), restScaleY);
            bump *= decay;
        }
        const id = canvas.animate(alias, { scaleX: arrayX, scaleY: arrayY }, rest, priority);
        if (id) {
            return [id];
        }
    }

    /**
     * Hop the canvas element: one deliberate displacement-and-return, optionally followed by smaller,
     * decaying secondary hops.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function hopEffect(
        alias: string,
        options: HopEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the hop effect can't be applied.`,
            );
            return;
        }
        const {
            direction = "up",
            distance = 40,
            secondaryHops = 0,
            decay = 0.5,
            ...rest
        } = options;
        const { axis, sign } = directionToAxisSign(direction);
        const restValue = axis === "x" ? component.position.x : component.position.y;
        const array: number[] = [restValue];
        let peak = distance;
        for (let i = 0; i < 1 + secondaryHops; i++) {
            array.push(restValue + sign * peak, restValue);
            peak *= decay;
        }
        const id = canvas.animate(alias, { [axis]: array }, rest, priority);
        if (id) {
            return [id];
        }
    }

    /**
     * Wiggle the canvas element: a decaying rotation oscillation around its current angle.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function wiggleEffect(
        alias: string,
        options: WiggleEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the wiggle effect can't be applied.`,
            );
            return;
        }
        const { angle = 15, repetitions = 3, decay = 0.5, ...rest } = options;
        const restRotation = component.rotation;
        const peakRad = (angle * Math.PI) / 180;
        const array = buildDecayingOscillation(peakRad, decay, repetitions).map(
            (v) => restRotation + v,
        );
        const id = canvas.animate(alias, { rotation: array }, rest, priority);
        if (id) {
            return [id];
        }
    }

    /**
     * Nod the canvas element: a decaying positional oscillation along one axis.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function nodEffect(
        alias: string,
        options: NodEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the nod effect can't be applied.`,
            );
            return;
        }
        const {
            axis = "horizontal",
            distance = 15,
            repetitions = 3,
            decay = 0.5,
            ...rest
        } = options;
        const prop = axis === "horizontal" ? "x" : "y";
        const restValue = axis === "horizontal" ? component.position.x : component.position.y;
        const array = buildDecayingOscillation(distance, decay, repetitions).map(
            (v) => restValue + v,
        );
        const id = canvas.animate(alias, { [prop]: array }, rest, priority);
        if (id) {
            return [id];
        }
    }

    /**
     * Sway the canvas element: a smooth, optionally combined positional and rotational drift around its
     * current state - a gentler, slower cousin of {@link nodEffect}/{@link wiggleEffect}.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function swayEffect(
        alias: string,
        options: SwayEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the sway effect can't be applied.`,
            );
            return;
        }
        const {
            axis = "horizontal",
            distance = 10,
            angle = 5,
            repetitions = 3,
            decay = 0,
            ease = "easeInOut",
            ...rest
        } = options;
        const prop = axis === "horizontal" ? "x" : "y";
        const restValue = axis === "horizontal" ? component.position.x : component.position.y;
        const restRotation = component.rotation;
        const peakRad = (angle * Math.PI) / 180;
        const positionArray = buildDecayingOscillation(distance, decay || 1, repetitions).map(
            (v) => restValue + v,
        );
        const rotationArray = buildDecayingOscillation(peakRad, decay || 1, repetitions).map(
            (v) => restRotation + v,
        );
        const id = canvas.animate(
            alias,
            { [prop]: positionArray, rotation: rotationArray },
            { ease, ...rest },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Punch the canvas element: a single fast impulse (position, rotation, or scale) with a strong
     * attack and a short, slightly overshooting recovery back to rest - unlike every other effect here,
     * this is a one-shot impact, not a repeated oscillation.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function punchEffect(
        alias: string,
        options: PunchEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the punch effect can't be applied.`,
            );
            return;
        }
        const { mode = "scale", strength = 0.3, overshoot = 0.3, ...rest } = options;
        let id: string | undefined;
        if (mode === "scale") {
            // Multiplicative, like pulseEffect - an additive delta shared across both axes would
            // distort a non-uniformly-scaled component's aspect ratio.
            const buildArray = (restValue: number) => [
                restValue,
                restValue * (1 + strength),
                restValue * (1 - strength * overshoot),
                restValue,
            ];
            id = canvas.animate(
                alias,
                { scaleX: buildArray(component.scale.x), scaleY: buildArray(component.scale.y) },
                rest,
                priority,
            );
        } else {
            const rest0 =
                mode === "rotation"
                    ? component.rotation
                    : mode === "x"
                      ? component.position.x
                      : component.position.y;
            const peak = mode === "rotation" ? (strength * Math.PI) / 180 : strength;
            const array = [rest0, rest0 + peak, rest0 - peak * overshoot, rest0];
            id = canvas.animate(alias, { [mode]: array }, rest, priority);
        }
        if (id) {
            return [id];
        }
    }

    /**
     * Glitch the canvas element: decaying, jittery bursts of digital-corruption slice displacement
     * ({@link https://pixijs.io/filters/docs/GlitchFilter.html GlitchFilter}) - each burst snaps,
     * kicks back the other way and settles - with a matching red/blue channel split layered on top
     * ({@link https://pixijs.io/filters/docs/RGBSplitFilter.html RGBSplitFilter}, see
     * {@link GlitchEffectProps.rgbSplit}). Both filters are removed once done. Returns one ticker id
     * per filter.
     *
     * Known cosmetic quirk: `GlitchFilter`'s own `destroy()` (called once this effect completes, to
     * clean up its displacement texture) can log a harmless `PixiJS Warning: [BindGroup] a
     * 'textureSource'/'textureSampler' was destroyed while still bound to a shader` in the console -
     * this comes from `pixi-filters`' own implementation, not from this effect, doesn't affect the
     * component's rendering or state, and every property is still correctly restored/detached.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function glitchEffect(
        alias: string,
        options: GlitchEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the glitch effect can't be applied.`,
            );
            return;
        }
        const {
            strength = 40,
            bursts = 3,
            slices = 8,
            direction = 0,
            rgbSplit = 6,
            decay = 0.5,
            ease = "linear",
            ...rest
        } = options;
        const glitchFilter = new filters.GlitchFilter({ slices, direction, offset: 0 });
        glitchFilter.refresh();
        // Room for slices shifted past the component's edges (otherwise they're cut off).
        glitchFilter.padding = Math.ceil(Math.abs(strength));
        const ids: string[] = [];
        const glitchId = addMotionFilterEffect(
            alias,
            component,
            glitchFilter as Filter,
            { offset: buildGlitchJitter(strength, decay, bursts) },
            { ease, ...rest },
            priority,
        );
        glitchId && ids.push(glitchId);
        if (rgbSplit !== 0) {
            const envelope = buildGlitchJitter(rgbSplit, decay, bursts);
            const split = new filters.RGBSplitFilter({
                red: { x: 0, y: 0 },
                green: { x: 0, y: 0 },
                blue: { x: 0, y: 0 },
            });
            split.padding = Math.ceil(Math.abs(rgbSplit));
            const splitId = addMotionFilterEffect(
                alias,
                component,
                split,
                { redX: envelope, blueX: envelope.map((v) => -v) },
                { ease, ...rest },
                priority,
            );
            splitId && ids.push(splitId);
        }
        if (ids.length > 0) {
            return ids;
        }
    }

    /**
     * Chromatic-aberration the canvas element: the red and blue color channels split apart in opposite
     * directions and snap back, in a decaying burst
     * ({@link https://pixijs.io/filters/docs/RGBSplitFilter.html RGBSplitFilter}).
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function chromaticAberrationEffect(
        alias: string,
        options: ChromaticAberrationEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the chromatic aberration effect can't be applied.`,
            );
            return;
        }
        const { strength = 8, axis = "horizontal", bursts = 1, decay = 0.5, ...rest } = options;
        const filter: Filter = new filters.RGBSplitFilter({
            red: { x: 0, y: 0 },
            green: { x: 0, y: 0 },
            blue: { x: 0, y: 0 },
        });
        // Room for the channels shifted past the component's edges (otherwise they're cut off).
        filter.padding = Math.ceil(Math.abs(strength));
        const redProp = axis === "horizontal" ? "redX" : "redY";
        const blueProp = axis === "horizontal" ? "blueX" : "blueY";
        const keyframes = {
            [redProp]: buildDecayingPulses(0, strength, decay, bursts),
            [blueProp]: buildDecayingPulses(0, -strength, decay, bursts),
        };
        const id = addMotionFilterEffect(alias, component, filter, keyframes, rest, priority);
        if (id) {
            return [id];
        }
    }

    /**
     * Shockwave the canvas element: a single radial ripple distortion travels outward from an origin
     * point and fades ({@link https://pixijs.io/filters/docs/ShockwaveFilter.html ShockwaveFilter}) -
     * a one-shot impact, not a repeated oscillation.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function shockwaveEffect(
        alias: string,
        options: ShockwaveEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the shockwave effect can't be applied.`,
            );
            return;
        }
        const {
            origin = { x: 0.5, y: 0.5 },
            amplitude = 30,
            wavelength = 160,
            brightness = 1,
            radius = -1,
            speed = 500,
            strength: strengthOption,
            ...rest
        } = options;
        const { width, height } = component.getBounds();
        const strength =
            strengthOption ??
            shockwaveTravel(
                { x: origin.x * width, y: origin.y * height },
                { width, height },
                wavelength,
                radius,
            ) / speed;
        const shockwave = new filters.ShockwaveFilter({
            center: { x: 0, y: 0 },
            amplitude,
            wavelength,
            brightness,
            radius,
            speed,
            time: 0,
        });
        // The shader displaces by up to 1.25x `amplitude` - room for edges pushed past the bounds.
        shockwave.padding = Math.ceil(Math.abs(amplitude) * 1.25);
        const id = addMotionFilterEffect(
            alias,
            component,
            shockwave,
            { time: [0, strength] },
            rest,
            priority,
            () => {
                const { x, y } = componentFilterCenter(component, origin);
                shockwave.center = { x, y };
            },
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Radially blur the canvas element: a decaying burst of zoom-blur radiating from an origin point,
     * settling back to no blur between and after each burst
     * ({@link https://pixijs.io/filters/docs/ZoomBlurFilter.html ZoomBlurFilter}).
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function radialBlurEffect(
        alias: string,
        options: RadialBlurEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the radial blur effect can't be applied.`,
            );
            return;
        }
        const {
            strength = 0.5,
            bursts = 1,
            origin = { x: 0.5, y: 0.5 },
            innerRadius = 0,
            radius = -1,
            decay = 0.5,
            ...rest
        } = options;
        const zoom = new filters.ZoomBlurFilter({
            center: { x: 0, y: 0 },
            innerRadius,
            radius,
            strength: 0,
        });
        const { width, height } = component.getBounds();
        zoom.padding = zoomBlurPadding(
            { x: origin.x * width, y: origin.y * height },
            strength,
            width,
            height,
        );
        const array = buildDecayingPulses(0, strength, decay, bursts);
        const id = addMotionFilterEffect(
            alias,
            component,
            zoom,
            { strength: array },
            rest,
            priority,
            () => {
                const { x, y } = componentFilterCenter(component, origin);
                zoom.center = { x, y };
            },
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Pulse a blur on the canvas element: a repeated, decaying blur bump that settles back to no blur
     * between and after each pulse ({@link https://pixijs.io/filters/docs/BlurFilter.html BlurFilter}).
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function blurPulseEffect(
        alias: string,
        options: BlurPulseEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the blur pulse effect can't be applied.`,
            );
            return;
        }
        const { strength = 8, pulses = 3, quality, decay = 0.5, ...rest } = options;
        const filter: Filter = new filters.BlurFilter({ strength: 0, quality });
        const array = buildDecayingPulses(0, strength, decay, pulses);
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { strength: array },
            rest,
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Pulse a vignette on the canvas element: the edges darken and recover, in a repeated, decaying
     * pulse - built on {@link https://pixijs.io/filters/docs/CRTFilter.html CRTFilter} with its
     * scanline/noise features turned off, isolating just the vignette.
     *
     * The vignette darkens the corners of the element's own bounding rectangle, so it's meant for
     * backgrounds and other full-frame images; on a sprite with transparent corners (a character, a
     * shape) there's little to darken and it barely shows.
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function vignettePulseEffect(
        alias: string,
        options: VignettePulseEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the vignette pulse effect can't be applied.`,
            );
            return;
        }
        const {
            strength = 1,
            pulses = 1,
            radius = 0.5,
            blur = 0.5,
            decay = 0.5,
            ...rest
        } = options;
        const filter: Filter = new filters.CRTFilter({
            curvature: 0,
            lineWidth: 0,
            lineContrast: 0,
            noise: 0,
            vignetting: radius,
            vignettingBlur: blur,
            vignettingAlpha: 0,
        });
        const array = buildDecayingPulses(0, strength, decay, pulses);
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { vignettingAlpha: array },
            rest,
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Desaturate the canvas element: color drains out to {@link DesaturateEffectProps.amount} and
     * recovers back to normal - a single dip, not a repeated oscillation
     * ({@link https://pixijs.io/filters/docs/AdjustmentFilter.html AdjustmentFilter}).
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function desaturateEffect(
        alias: string,
        options: DesaturateEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the desaturate effect can't be applied.`,
            );
            return;
        }
        const { amount = 0, duration: fadeDuration = 1, holdDuration = 0, ...rest } = options;
        const total = fadeDuration * 2 + holdDuration;
        const times = [0, fadeDuration / total, (fadeDuration + holdDuration) / total, 1];
        const filter: Filter = new filters.AdjustmentFilter({ saturation: 1 });
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { saturation: [1, amount, amount, 1] },
            { ...rest, duration: total, times },
            priority,
        );
        if (id) {
            return [id];
        }
    }

    /**
     * Pulse a glow on the canvas element: a repeated, decaying outward glow that settles back to no
     * glow between and after each pulse ({@link https://pixijs.io/filters/docs/GlowFilter.html GlowFilter}).
     * @param alias The alias to identify the component.
     * @param options Animation options.
     * @param priority The priority of the PixiJS ticker.
     */
    export async function glowPulseEffect(
        alias: string,
        options: GlowPulseEffectProps = {},
        priority?: UPDATE_PRIORITY,
    ): Promise<string[] | undefined> {
        const component = canvas.find(alias);
        if (!component) {
            logger.error(
                `The element with the alias ${alias} does not exist. So the glow pulse effect can't be applied.`,
            );
            return;
        }
        const {
            strength = 4,
            pulses = 3,
            color = 0xffffff,
            distance = 10,
            innerStrength = 0,
            decay = 0.5,
            ...rest
        } = options;
        const filter: Filter = new filters.GlowFilter({
            outerStrength: 0,
            innerStrength,
            distance,
            color,
        });
        const array = buildDecayingPulses(0, strength, decay, pulses);
        const id = addMotionFilterEffect(
            alias,
            component,
            filter,
            { outerStrength: array },
            rest,
            priority,
        );
        if (id) {
            return [id];
        }
    }
}
