import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    buildGlitchJitter,
    circleOverhang,
    filterAreaCenter,
    shockwaveTravel,
    zoomBlurPadding,
} from "../src/canvas/functions/filter-effect-utility";
import { canvas, transitions, type CanvasBaseInterface } from "../src/canvas";
import { filters } from "../src/filters";

afterEach(() => vi.restoreAllMocks());

beforeEach(() => {
    // GlitchFilter draws its displacement map on a scratch <canvas>; jsdom has no 2D context.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        clearRect: () => {},
        fillRect: () => {},
        set fillStyle(_: unknown) {},
    } as unknown as CanvasRenderingContext2D);
});

function createSprite(): CanvasBaseInterface<any> {
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.position.set(100, 50);
    sprite.scale.set(2, 3);
    return sprite as unknown as CanvasBaseInterface<any>;
}

/** Mocks everything a filter transition touches on the canvas; `existing` is what `canvas.find` returns. */
function spyOnTransition(existing?: CanvasBaseInterface<any>) {
    vi.spyOn(canvas, "find").mockReturnValue(existing);
    vi.spyOn(canvas, "add").mockImplementation(() => undefined as any);
    vi.spyOn(canvas, "editAlias").mockImplementation(() => undefined as any);
    vi.spyOn(canvas, "copyCanvasElementProperty").mockImplementation(() => undefined as any);
    const animate = vi.spyOn(canvas, "animate").mockReturnValue("canvas-ticker");
    const animateFilter = vi.spyOn(filters, "animate").mockReturnValue("filter-ticker");
    return { animate, animateFilter };
}

type FilterCall = [string, any, Record<string, number[]>, Record<string, any>];

function filterCalls(spy: ReturnType<typeof spyOnTransition>["animateFilter"]): FilterCall[] {
    return spy.mock.calls as unknown as FilterCall[];
}

function expectCloseArray(actual: number[], expected: number[]) {
    expect(actual).toHaveLength(expected.length);
    actual.forEach((v, i) => expect(v).toBeCloseTo(expected[i]));
}

describe("filter-effect-utility", () => {
    const bounds = { x: 100, y: 50, width: 200, height: 100 };
    const padded = (padding: number) => ({ padding, enabled: true });

    test("filterAreaCenter: pixels from the area's corner, which is grown by the SUM of the paddings", () => {
        expect(filterAreaCenter(bounds, { x: 0.25, y: 1 }, [])).toMatchObject({ x: 50, y: 100 });
        const { x, y, area } = filterAreaCenter(bounds, { x: 0.5, y: 0.5 }, [padded(20), padded(5)]);
        expect({ x, y }).toEqual({ x: 125, y: 75 });
        expect(area).toEqual({ x: 75, y: 25, width: 250, height: 150 });
    });

    test("filterAreaCenter ignores disabled filters and clips to the viewport before padding", () => {
        const offscreen = { x: -50, y: 0, width: 200, height: 100 };
        const { x, area } = filterAreaCenter(offscreen, { x: 0.5, y: 0.5 }, [padded(10), { padding: 99, enabled: false }], {
            width: 800,
            height: 600,
        });
        // Clipped to x=0 first, then padded: the area starts at -10, so the element's center (x=50) is 60 in.
        expect(area.x).toBe(-10);
        expect(x).toBe(60);
    });

    test("circleOverhang: how far a circle around the center sticks out of the bounds", () => {
        expect(circleOverhang({ x: 100, y: 50 }, 80, 200, 100)).toBe(30);
        expect(circleOverhang({ x: 100, y: 50 }, 20, 200, 100)).toBe(0);
    });

    test("zoomBlurPadding: content at distance D reaches D / (1 - strength), strength capped at 0.5", () => {
        // Centered 60x80: farthest corner at 50.
        expect(zoomBlurPadding({ x: 30, y: 40 }, 0.2, 60, 80)).toBe(Math.ceil((50 * 0.2) / 0.8));
        expect(zoomBlurPadding({ x: 30, y: 40 }, 0.9, 60, 80)).toBe(50);
    });

    test("shockwaveTravel reaches the farthest corner plus half a wavelength, or stops at radius", () => {
        expect(shockwaveTravel({ x: 0, y: 0 }, { width: 30, height: 40 }, 20, -1)).toBe(50 + 10);
        expect(shockwaveTravel({ x: 0, y: 0 }, { width: 30, height: 40 }, 20, 25)).toBe(25);
    });

    test("buildGlitchJitter snaps, kicks back and settles per burst", () => {
        expectCloseArray(buildGlitchJitter(10, 0.5, 2), [0, 10, -6, 3, 0, 5, -3, 1.5, 0]);
    });
});

const outTransitions = [
    ["glitchOut", () => transitions.glitchOut("alias")],
    ["twistOut", () => transitions.twistOut("alias")],
    ["warpOut", () => transitions.warpOut("alias")],
    ["rippleOut", () => transitions.rippleOut("alias")],
    ["noiseDissolveOut", () => transitions.noiseDissolveOut("alias")],
    ["tvOut", () => transitions.tvOut("alias")],
    ["pinchOut", () => transitions.pinchOut("alias")],
] as const;

describe.each(outTransitions)("%s", (_name, run) => {
    test("warns and no-ops when the alias isn't found", () => {
        const { animate, animateFilter } = spyOnTransition(undefined);
        expect(run()).toBeUndefined();
        expect(animate).not.toHaveBeenCalled();
        expect(animateFilter).not.toHaveBeenCalled();
    });

    test("removes the component once its main ticker completes", () => {
        const target = createSprite();
        const { animate, animateFilter } = spyOnTransition(target);
        expect(run()).toBeDefined();
        const removals = [
            ...animate.mock.calls.map((c) => (c[2] as any)?.aliasToRemoveAfter),
            ...filterCalls(animateFilter).map((c) => c[3].aliasToRemoveAfter),
        ].filter((r): r is string[] => Array.isArray(r) && r.includes("alias"));
        expect(removals).toHaveLength(1);
    });
});

describe("glitchIn/glitchOut", () => {
    test("glitchIn settles from its strongest burst, with a matching RGB split, and fades in", async () => {
        const { animate, animateFilter } = spyOnTransition(undefined);
        const target = createSprite();

        const ids = await transitions.glitchIn("alias", target, { strength: 20, bursts: 2 });

        expect(ids).toEqual(["filter-ticker", "filter-ticker"]);
        const [glitch, split] = filterCalls(animateFilter);
        expect(glitch[1]).toBeInstanceOf(filters.GlitchFilter);
        expectCloseArray(glitch[2].offset, buildGlitchJitter(20, 0.5, 2));
        expect(glitch[3].ease).toBe("linear");
        expect(split[1]).toBeInstanceOf(filters.RGBSplitFilter);
        expectCloseArray(split[2].redX, buildGlitchJitter(6, 0.5, 2));
        expect(animate).toHaveBeenCalledTimes(1); // fadeComponent defaults to true
    });

    test("glitchOut builds up towards removal (reversed envelope); rgbSplit: 0 drops the split", () => {
        const { animateFilter } = spyOnTransition(createSprite());

        transitions.glitchOut("alias", { strength: 20, bursts: 2, rgbSplit: 0, fadeComponent: false });

        expect(animateFilter).toHaveBeenCalledTimes(1);
        expectCloseArray(filterCalls(animateFilter)[0][2].offset, buildGlitchJitter(20, 0.5, 2).reverse());
    });
});

describe("twistIn/twistOut", () => {
    test("twistIn unwinds from the given angle (degrees) to 0 around the padded center", async () => {
        const { animateFilter } = spyOnTransition(undefined);
        const target = createSprite();
        const { width, height } = target.getBounds();

        await transitions.twistIn("alias", target, { angle: 180 });

        const [[, filter, keyframes]] = filterCalls(animateFilter);
        expect(filter).toBeInstanceOf(filters.TwistFilter);
        expectCloseArray(keyframes.angle, [Math.PI, 0]);
        expect(filter.offsetX).toBeCloseTo(filter.padding + width / 2);
        expect(filter.offsetY).toBeCloseTo(filter.padding + height / 2);
        expect(filter.radius).toBeCloseTo(Math.hypot(width, height) / 2);
    });

    test("twistOut winds up from 0", () => {
        const { animateFilter } = spyOnTransition(createSprite());
        transitions.twistOut("alias", { angle: 90 });
        expectCloseArray(filterCalls(animateFilter)[0][2].angle, [0, Math.PI / 2]);
    });
});

describe("warpIn/warpOut", () => {
    test("zoom-blur strength runs strength -> 0 (in) and 0 -> strength (out), centered in pixels", async () => {
        const { animateFilter } = spyOnTransition(undefined);
        const target = createSprite();
        const { width } = target.getBounds();

        await transitions.warpIn("alias", target, { strength: 0.4 });
        vi.spyOn(canvas, "find").mockReturnValue(target);
        transitions.warpOut("alias", { strength: 0.4 });

        const [[, inFilter, inKeyframes], [, , outKeyframes]] = filterCalls(animateFilter);
        expect(inFilter).toBeInstanceOf(filters.ZoomBlurFilter);
        expect(inFilter.center.x).toBeCloseTo(inFilter.padding + width / 2);
        expect(inKeyframes.strength).toEqual([0.4, 0]);
        expect(outKeyframes.strength).toEqual([0, 0.4]);
    });
});

describe("rippleIn/rippleOut", () => {
    test("the ring always travels until it has left the component", async () => {
        const { animateFilter } = spyOnTransition(undefined);
        const target = createSprite();
        const { width, height } = target.getBounds();

        await transitions.rippleIn("alias", target, { wavelength: 100, speed: 250 });

        const [[, filter, keyframes]] = filterCalls(animateFilter);
        expect(filter).toBeInstanceOf(filters.ShockwaveFilter);
        const travel = shockwaveTravel({ x: width / 2, y: height / 2 }, { width, height }, 100, -1);
        expectCloseArray(keyframes.time, [0, travel / 250]);
    });
});

describe("noiseDissolveIn/noiseDissolveOut", () => {
    test("hard edge thresholds at 0.5 and spans only the visible strength range; no fade by default", async () => {
        const { animate, animateFilter } = spyOnTransition(undefined);

        await transitions.noiseDissolveIn("alias", createSprite(), { seed: 7 });

        const [[, filter, keyframes]] = filterCalls(animateFilter);
        expect(filter).toBeInstanceOf(filters.SimplexNoiseFilter);
        expect(filter.step).toBe(0.5);
        expect(filter.offsetZ).toBe(7);
        expect(keyframes.strength).toEqual([0.25, 0.75]);
        expect(animate).not.toHaveBeenCalled();
    });

    test("soft edge uses no threshold and the full 0 -> 1 range; out runs backwards", () => {
        const { animateFilter } = spyOnTransition(createSprite());

        transitions.noiseDissolveOut("alias", { edge: "soft" });

        const [[, filter, keyframes]] = filterCalls(animateFilter);
        expect(filter.step).toBe(0);
        expect(keyframes.strength).toEqual([1, 0]);
    });
});

describe("tvIn/tvOut", () => {
    test("tvOut collapses to a glowing line, then a dot, relative to the current scale", () => {
        const target = createSprite();
        const { animate, animateFilter } = spyOnTransition(target);

        transitions.tvOut("alias", { lineThickness: 0.1, brightness: 2 });

        const [, keyframes, options] = animate.mock.calls[0] as [string, any, any];
        expect(keyframes.scaleX).toEqual([2, 2, 0]);
        expectCloseArray(keyframes.scaleY, [3, 0.3, 0.3]);
        expect(options.times).toEqual([0, 0.55, 1]);
        expect(options.aliasToRemoveAfter).toEqual(["alias"]);
        const [glow, crt] = filterCalls(animateFilter);
        expect(glow[1]).toBeInstanceOf(filters.AdjustmentFilter);
        expect(glow[2].brightness).toEqual([1, 2, 2]);
        expect(crt[1]).toBeInstanceOf(filters.CRTFilter);
    });

    test("tvIn starts from the dot and opens up; scanlines: false skips the CRT filter", async () => {
        const { animate, animateFilter } = spyOnTransition(undefined);
        const target = createSprite();

        await transitions.tvIn("alias", target, { lineThickness: 0.1, scanlines: false });

        const [, keyframes] = animate.mock.calls[0] as [string, any, any];
        expect(keyframes.scaleX).toEqual([0, 2, 2]);
        expectCloseArray(keyframes.scaleY, [0.3, 0.3, 3]);
        expect(target.scale.x).toBe(0);
        expect(animateFilter).toHaveBeenCalledTimes(1);
    });
});

describe("pinchIn/pinchOut", () => {
    test("pinch deforms with negative strength, bulge with positive; center stays normalized", async () => {
        const { animateFilter } = spyOnTransition(undefined);

        const target = createSprite();
        await transitions.pinchIn("alias", target, { strength: 0.8, origin: { x: 0.2, y: 0.7 } });
        vi.spyOn(canvas, "find").mockReturnValue(target);
        transitions.pinchOut("alias", { mode: "bulge" });

        const [[, filter, inKeyframes], [, , outKeyframes]] = filterCalls(animateFilter);
        expect(filter).toBeInstanceOf(filters.BulgePinchFilter);
        expect(filter.center.x).toBeCloseTo(0.2);
        expect(filter.center.y).toBeCloseTo(0.7);
        expect(inKeyframes.strength).toEqual([-0.8, 0]);
        expect(outKeyframes.strength).toEqual([0, 1]);
    });
});

test("an xIn replacing an existing component removes the old one once the effect ends", async () => {
    const old = createSprite();
    const { animateFilter } = spyOnTransition(old);

    await transitions.twistIn("alias", createSprite(), { fadeComponent: false });

    expect(filterCalls(animateFilter)[0][3].aliasToRemoveAfter).toEqual(["alias_temp_twist"]);
});

describe("motionBlur on move/push", () => {
    test("moveOut adds a MotionBlurFilter ramping along the movement axis and back to sharp", () => {
        const { animateFilter } = spyOnTransition(createSprite());

        const ids = transitions.moveOut("alias", { direction: "left", motionBlur: true, duration: 0.5 });

        expect(ids).toEqual(["canvas-ticker", "filter-ticker"]);
        const [[, filter, keyframes, options]] = filterCalls(animateFilter);
        expect(filter).toBeInstanceOf(filters.MotionBlurFilter);
        expect(keyframes.velocityX).toEqual([0, -40, 0]);
        expect(options.duration).toBe(0.5);
    });

    test("a number sets the trail length; vertical directions blur along y; autoplay is forwarded", () => {
        const { animateFilter } = spyOnTransition(createSprite());

        transitions.moveOut("alias", { direction: "down", motionBlur: 25, autoplay: false });

        const [[, , keyframes, options]] = filterCalls(animateFilter);
        expect(keyframes.velocityY).toEqual([0, 25, 0]);
        expect(options.autoplay).toBe(false);
    });

    test("no motion blur unless asked for", () => {
        const { animateFilter } = spyOnTransition(createSprite());
        expect(transitions.moveOut("alias", { direction: "right" })).toEqual(["canvas-ticker"]);
        expect(animateFilter).not.toHaveBeenCalled();
    });
});
