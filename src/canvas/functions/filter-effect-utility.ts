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

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Where an `origin` normalized (0-1) to the component's bounds lands, in pixels, inside the area
 * PixiJS renders the component's filters into - the coordinates `ShockwaveFilter`/`ZoomBlurFilter`
 * (`center`) and `TwistFilter` (`offset`) expect. Mirrors `FilterSystem._calculateFilterBounds`: the
 * component's global bounds, clipped to the viewport, then grown on every side by the **sum** of every
 * enabled filter's `padding`. Call it once all of the effect's filters are attached; it's a snapshot,
 * so adding/removing padded filters later shifts the area.
 */
export function filterAreaCenter(
    bounds: Rect,
    origin: { x: number; y: number },
    filters: readonly { padding: number; enabled: boolean }[],
    viewport?: { width: number; height: number },
): { x: number; y: number; area: Rect } {
    const padding = filters.reduce((sum, f) => (f.enabled ? sum + f.padding : sum), 0);
    let minX = bounds.x;
    let minY = bounds.y;
    let maxX = bounds.x + bounds.width;
    let maxY = bounds.y + bounds.height;
    if (viewport) {
        minX = Math.max(minX, 0);
        minY = Math.max(minY, 0);
        maxX = Math.min(maxX, viewport.width);
        maxY = Math.min(maxY, viewport.height);
    }
    const area = {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
    };
    return {
        x: bounds.x + origin.x * bounds.width - area.x,
        y: bounds.y + origin.y * bounds.height - area.y,
        area,
    };
}

/**
 * How far (pixels) content can be pushed past the component's own bounds by a deformation confined to
 * a circle of `radius` around `center` (twist, bulge): the circle's overhang beyond the bounds.
 */
export function circleOverhang(center: { x: number; y: number }, radius: number, width: number, height: number): number {
    return Math.max(0, Math.ceil(radius - Math.min(center.x, center.y, width - center.x, height - center.y)));
}

/**
 * Padding a `ZoomBlurFilter` needs for its streaks to extend past the component instead of being cut:
 * a pixel at distance `d` from the center samples back to `d * (1 - strength)`, so content at distance
 * `D` reaches `D / (1 - strength)`. `strength` is capped at 0.5 (padding at most `D`) - the outermost
 * streaks are faint anyway.
 */
export function zoomBlurPadding(center: { x: number; y: number }, strength: number, width: number, height: number): number {
    const s = Math.min(Math.max(strength, 0), 0.5);
    const farthest = Math.hypot(Math.max(center.x, width - center.x), Math.max(center.y, height - center.y));
    return Math.ceil((farthest * s) / (1 - s));
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
