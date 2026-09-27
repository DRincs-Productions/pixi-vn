/**
 * Keyframe/geometry helpers shared by the filter-based `effects` (`canvas-effect.ts`) and
 * `transitions` (`canvas-transition.ts`). Kept in their own module because `canvas-effect.ts` already
 * imports from `canvas-transition.ts`, so the reverse import would be circular.
 */

/**
 * Builds a jittery `[0, a, -0.6a, 0.3a, 0, ...]` glitch envelope: each burst snaps to `a`, kicks back
 * the other way, twitches and settles, with `a` shrinking by `decay` per burst. The sign flips reverse
 * the slice displacement mid-burst, which reads as a glitch rather than a smooth slide.
 */
export function buildGlitchJitter(peak: number, decay: number, bursts: number): number[] {
    const values: number[] = [0];
    let amplitude = peak;
    for (let i = 0; i < bursts; i++) {
        values.push(amplitude, -amplitude * 0.6, amplitude * 0.3, 0);
        amplitude *= decay;
    }
    return values;
}

/**
 * Converts an `origin` normalized (0-1) to the component's own bounds into the pixel coordinates that
 * `ShockwaveFilter`/`ZoomBlurFilter` (`center`) and `TwistFilter` (`offset`) expect: their shaders
 * work in pixels relative to the filter's input area - the component's global bounds, grown by the
 * filter's own `padding` on every side.
 */
export function originToFilterCenter(
    component: { getBounds(): { width: number; height: number } },
    origin: { x: number; y: number },
    padding: number = 0,
): { x: number; y: number; width: number; height: number } {
    const { width, height } = component.getBounds();
    return { x: padding + origin.x * width, y: padding + origin.y * height, width, height };
}

/**
 * How far (pixels) a `ShockwaveFilter` ring has to travel to fully leave the component: from `center`
 * to the farthest corner of `bounds`, plus half a `wavelength` - or just `radius` when the ring is
 * capped (`radius > 0`).
 */
export function shockwaveTravel(
    center: { x: number; y: number },
    bounds: { width: number; height: number },
    wavelength: number,
    radius: number,
): number {
    if (radius > 0) {
        return radius;
    }
    return (
        Math.hypot(Math.max(center.x, bounds.width - center.x), Math.max(center.y, bounds.height - center.y)) +
        wavelength / 2
    );
}
