export type EasingFunction = (t: number) => number;
export type EasingInput =
    | string
    | readonly number[]
    | EasingFunction
    | readonly (string | readonly number[] | EasingFunction)[]
    | undefined;

function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
    function bezierCoord(t: number, p1: number, p2: number): number {
        const mt = 1 - t;
        return 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t;
    }
    return (t: number): number => {
        if (t <= 0) {
            return 0;
        }
        if (t >= 1) {
            return 1;
        }
        let lo = 0;
        let hi = 1;
        let mid = t;
        for (let i = 0; i < 20; i++) {
            mid = (lo + hi) / 2;
            const x = bezierCoord(mid, x1, x2);
            if (Math.abs(x - t) < 1e-5) {
                break;
            }
            if (x < t) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        return bezierCoord(mid, y1, y2);
    };
}

const NAMED_EASINGS: Record<string, EasingFunction> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    circIn: (t) => 1 - Math.sqrt(1 - t * t),
    circOut: (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
    circInOut: (t) =>
        t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
};

/**
 * Resolves the small subset of `motion`'s `ease` option (named eases, cubic-bezier `[x1,y1,x2,y2]`
 * arrays, and custom functions) that {@link FilterProgressTicker} can apply without depending on the
 * `motion` package itself (kept out of `src/canvas` to avoid a circular module dependency on
 * `src/motion`, which itself depends on `canvas`). Anything else falls back to linear.
 */
export function resolveEasing(ease: EasingInput): EasingFunction {
    const value = Array.isArray(ease) ? ease[0] : ease;
    if (typeof value === "function") {
        return value;
    }
    if (typeof value === "string" && NAMED_EASINGS[value]) {
        return NAMED_EASINGS[value];
    }
    if (Array.isArray(value) && value.length === 4 && value.every((n) => typeof n === "number")) {
        const [x1, y1, x2, y2] = value as number[];
        return cubicBezier(x1, y1, x2, y2);
    }
    return NAMED_EASINGS.linear;
}
