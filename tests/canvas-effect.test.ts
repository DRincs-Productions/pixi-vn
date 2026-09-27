import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { canvas, effects } from "../src/canvas";
import { filters } from "../src/filters";

afterEach(() => vi.restoreAllMocks());

function createSprite() {
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.position.set(100, 50);
    sprite.scale.set(2, 3);
    sprite.rotation = 0.4;
    return sprite as unknown as import("../src/canvas").CanvasBaseInterface<any>;
}

function spyOnCanvas(target: import("../src/canvas").CanvasBaseInterface<any> | undefined) {
    vi.spyOn(canvas, "find").mockReturnValue(target);
    return vi.spyOn(canvas, "animate").mockReturnValue("ticker-id");
}

function spyOnFilters(target: import("../src/canvas").CanvasBaseInterface<any> | undefined) {
    vi.spyOn(canvas, "find").mockReturnValue(target);
    return vi.spyOn(filters, "animate").mockReturnValue("ticker-id");
}

describe.each([
    ["bounceEffect", () => effects.bounceEffect("alias")],
    ["pulseEffect", () => effects.pulseEffect("alias")],
    ["hopEffect", () => effects.hopEffect("alias")],
    ["wiggleEffect", () => effects.wiggleEffect("alias")],
    ["nodEffect", () => effects.nodEffect("alias")],
    ["swayEffect", () => effects.swayEffect("alias")],
    ["punchEffect", () => effects.punchEffect("alias")],
] as const)("%s: warns and no-ops when the alias isn't found", (_name, run) => {
    test("returns undefined without calling canvas.animate", async () => {
        const animateSpy = spyOnCanvas(undefined);
        await expect(run()).resolves.toBeUndefined();
        expect(animateSpy).not.toHaveBeenCalled();
    });
});

describe("bounceEffect", () => {
    test("builds a one-directional, decaying displacement array returning through rest", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = await effects.bounceEffect("alias", { direction: "up", distance: 30, bounces: 2, decay: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [alias, keyframes] = animateSpy.mock.calls[0] as [string, { y: number[] }, any];
        expect(alias).toBe("alias");
        // "up" -> negative y offsets, each successive bounce halved, always returning to rest (50).
        expect(keyframes.y).toEqual([50, 20, 50, 35, 50]);
    });

    test("direction picks the axis and sign of the displacement", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        await effects.bounceEffect("alias", { direction: "right", distance: 10, bounces: 1 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { x: number[] }, any];
        expect(keyframes.x).toEqual([100, 110, 100]);
    });
});

describe("pulseEffect", () => {
    test("builds a decaying scaleX/scaleY bump around the current scale", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = await effects.pulseEffect("alias", { scale: 1.5, pulses: 2, decay: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [, keyframes] = animateSpy.mock.calls[0] as [string, { scaleX: number[]; scaleY: number[] }, any];
        expect(keyframes.scaleX).toEqual([2, 3, 2, 2.5, 2]);
        expect(keyframes.scaleY).toEqual([3, 4.5, 3, 3.75, 3]);
    });
});

describe("hopEffect", () => {
    test("with no secondary hops, is a single displacement-and-return", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        await effects.hopEffect("alias", { direction: "up", distance: 40 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { y: number[] }, any];
        expect(keyframes.y).toEqual([50, 10, 50]);
    });

    test("secondaryHops appends smaller, decaying follow-up hops", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        await effects.hopEffect("alias", { direction: "down", distance: 20, secondaryHops: 2, decay: 0.5 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { y: number[] }, any];
        expect(keyframes.y).toEqual([50, 70, 50, 60, 50, 55, 50]);
    });
});

describe("wiggleEffect", () => {
    test("builds a decaying rotation oscillation around the current angle", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = await effects.wiggleEffect("alias", { angle: 90, repetitions: 2, decay: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [, keyframes] = animateSpy.mock.calls[0] as [string, { rotation: number[] }, any];
        const peak = (90 * Math.PI) / 180;
        expect(keyframes.rotation[0]).toBeCloseTo(0.4);
        expect(keyframes.rotation[1]).toBeCloseTo(0.4 + peak);
        expect(keyframes.rotation[2]).toBeCloseTo(0.4);
        expect(keyframes.rotation[3]).toBeCloseTo(0.4 - peak * 0.5);
        expect(keyframes.rotation[4]).toBeCloseTo(0.4);
    });
});

describe("nodEffect", () => {
    test("builds a decaying positional oscillation along the given axis", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = await effects.nodEffect("alias", { axis: "vertical", distance: 10, repetitions: 2, decay: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [, keyframes] = animateSpy.mock.calls[0] as [string, { y: number[] }, any];
        expect(keyframes.y).toEqual([50, 60, 50, 45, 50]);
    });

    test("defaults to the horizontal axis", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        await effects.nodEffect("alias", { distance: 5, repetitions: 1 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { x: number[] }, any];
        expect(keyframes.x).toEqual([100, 105, 100]);
    });
});

describe("swayEffect", () => {
    test("drifts both position and rotation, defaulting to a constant (non-decaying) amplitude", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = await effects.swayEffect("alias", { distance: 10, angle: 5, repetitions: 2 });

        expect(ids).toEqual(["ticker-id"]);
        const [, keyframes, options] = animateSpy.mock.calls[0] as [
            string,
            { x: number[]; rotation: number[] },
            any,
        ];
        // decay defaults to 0 -> treated as "no decay" (constant amplitude across repetitions),
        // but the oscillation still alternates sign each repetition (a sine-like sway, not a
        // one-directional push).
        expect(keyframes.x).toEqual([100, 110, 100, 90, 100]);
        expect(options.ease).toBe("easeInOut");
    });
});

describe("punchEffect", () => {
    test("scale mode: a single fast bump with a settle-back overshoot, multiplicative per axis", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = await effects.punchEffect("alias", { mode: "scale", strength: 0.4, overshoot: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [, keyframes] = animateSpy.mock.calls[0] as [string, { scaleX: number[]; scaleY: number[] }, any];
        // scaleX rest = 2: [2, 2*1.4, 2*(1-0.4*0.5), 2]; scaleY rest = 3, same multipliers applied to
        // its own rest value - each axis keeps its own aspect ratio, not a shared additive delta.
        keyframes.scaleX.forEach((v, i) => expect(v).toBeCloseTo([2, 2.8, 1.6, 2][i]));
        keyframes.scaleY.forEach((v, i) => expect(v).toBeCloseTo([3, 4.2, 2.4, 3][i]));
    });

    test("rotation mode animates the rotation property alone", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        await effects.punchEffect("alias", { mode: "rotation", strength: 30, overshoot: 0 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { rotation: number[] }, any];
        const peak = (30 * Math.PI) / 180;
        expect(keyframes.rotation[0]).toBeCloseTo(0.4);
        expect(keyframes.rotation[1]).toBeCloseTo(0.4 + peak);
        expect(keyframes.rotation[2]).toBeCloseTo(0.4);
        expect(keyframes.rotation[3]).toBeCloseTo(0.4);
    });

    test("x/y mode animates the position property alone", async () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        await effects.punchEffect("alias", { mode: "x", strength: 20, overshoot: 0.25 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { x: number[] }, any];
        expect(keyframes.x).toEqual([100, 120, 95, 100]);
    });
});

describe.each([
    ["glitchEffect", () => effects.glitchEffect("alias")],
    ["chromaticAberrationEffect", () => effects.chromaticAberrationEffect("alias")],
    ["shockwaveEffect", () => effects.shockwaveEffect("alias")],
    ["radialBlurEffect", () => effects.radialBlurEffect("alias")],
    ["blurPulseEffect", () => effects.blurPulseEffect("alias")],
    ["vignettePulseEffect", () => effects.vignettePulseEffect("alias")],
    ["desaturateEffect", () => effects.desaturateEffect("alias")],
    ["glowPulseEffect", () => effects.glowPulseEffect("alias")],
] as const)("%s: warns and no-ops when the alias isn't found", (_name, run) => {
    test("returns undefined without calling filters.animate", async () => {
        const animateSpy = spyOnFilters(undefined);
        await expect(run()).resolves.toBeUndefined();
        expect(animateSpy).not.toHaveBeenCalled();
    });
});

describe("glitchEffect", () => {
    test("builds a decaying offset burst on a GlitchFilter, returning to no displacement", async () => {
        // GlitchFilter's constructor draws onto a scratch <canvas> (2D context) to build its
        // displacement texture - jsdom doesn't implement getContext("2d") (see the same note in
        // tests/filters-round-trip.test.ts), so a minimal fake context is stubbed in just for this
        // test rather than excluding glitchEffect from Vitest entirely; the real drawing is still only
        // meaningfully verified in the sandbox (CLAUDE.md §3).
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
            clearRect: () => {},
            fillRect: () => {},
            set fillStyle(_: unknown) {},
        } as unknown as CanvasRenderingContext2D);

        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.glitchEffect("alias", { strength: 40, bursts: 2, decay: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [alias, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.GlitchFilter>,
            { offset: number[] },
            any,
        ];
        expect(alias).toBe("alias");
        expect(filter).toBeInstanceOf(filters.GlitchFilter);
        expect(keyframes.offset).toEqual([0, 40, 0, 20, 0]);
        expect(target.filters).toHaveLength(1);
    });
});

describe("chromaticAberrationEffect", () => {
    test("splits red/blue channels apart in opposite directions and back, on the horizontal axis by default", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.chromaticAberrationEffect("alias", { strength: 8 });

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.RGBSplitFilter>,
            { redX: number[]; blueX: number[] },
            any,
        ];
        expect(filter).toBeInstanceOf(filters.RGBSplitFilter);
        expect(keyframes.redX).toEqual([0, 8, 0]);
        expect(keyframes.blueX).toEqual([0, -8, 0]);
    });

    test("axis: 'vertical' splits along redY/blueY instead", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        await effects.chromaticAberrationEffect("alias", { strength: 8, axis: "vertical" });

        const [, , keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.RGBSplitFilter>,
            { redY: number[]; blueY: number[] },
            any,
        ];
        expect(keyframes.redY).toEqual([0, 8, 0]);
        expect(keyframes.blueY).toEqual([0, -8, 0]);
    });
});

describe("shockwaveEffect", () => {
    test("animates a single ripple's own 'time' from 0, defaulting strength from radius/speed", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.shockwaveEffect("alias", { radius: 300, speed: 500 });

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.ShockwaveFilter>,
            { time: number[] },
            any,
        ];
        expect(filter).toBeInstanceOf(filters.ShockwaveFilter);
        expect(keyframes.time).toEqual([0, 0.6]);
    });

    test("an infinite radius (the default) defaults strength to 1", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        await effects.shockwaveEffect("alias");

        const [, , keyframes] = animateSpy.mock.calls[0] as [string, any, { time: number[] }, any];
        expect(keyframes.time).toEqual([0, 1]);
    });
});

describe("radialBlurEffect", () => {
    test("builds a decaying zoom-blur strength burst, returning to no blur", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.radialBlurEffect("alias");

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.ZoomBlurFilter>,
            { strength: number[] },
            any,
        ];
        expect(filter).toBeInstanceOf(filters.ZoomBlurFilter);
        expect(keyframes.strength).toEqual([0, 0.5, 0]);
    });
});

describe("blurPulseEffect", () => {
    test("builds a decaying blur-strength pulse, returning to no blur", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.blurPulseEffect("alias");

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.BlurFilter>,
            { strength: number[] },
            any,
        ];
        expect(filter).toBeInstanceOf(filters.BlurFilter);
        expect(keyframes.strength).toEqual([0, 8, 0, 4, 0, 2, 0]);
    });
});

describe("vignettePulseEffect", () => {
    test("builds a decaying vignette-alpha pulse on a CRTFilter with scanlines/noise isolated off", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.vignettePulseEffect("alias");

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.CRTFilter>,
            { vignettingAlpha: number[] },
            any,
        ];
        expect(filter).toBeInstanceOf(filters.CRTFilter);
        expect(filter.curvature).toBe(0);
        expect(filter.lineWidth).toBe(0);
        expect(filter.noise).toBe(0);
        expect(keyframes.vignettingAlpha).toEqual([0, 1, 0]);
    });
});

describe("desaturateEffect", () => {
    test("dips saturation to 'amount' and back, with an explicit holdDuration stretching the total duration", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.desaturateEffect("alias", { amount: 0.2, duration: 1, holdDuration: 0.5 });

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes, options] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.AdjustmentFilter>,
            { saturation: number[] },
            { duration: number; times: number[] },
        ];
        expect(filter).toBeInstanceOf(filters.AdjustmentFilter);
        expect(keyframes.saturation).toEqual([1, 0.2, 0.2, 1]);
        // total = duration*2 + holdDuration = 2.5; the two middle stops mark the hold window.
        expect(options.duration).toBe(2.5);
        expect(options.times).toEqual([0, 0.4, 0.6, 1]);
    });
});

describe("glowPulseEffect", () => {
    test("builds a decaying outer-glow-strength pulse, returning to no glow", async () => {
        const target = createSprite();
        const animateSpy = spyOnFilters(target);

        const ids = await effects.glowPulseEffect("alias");

        expect(ids).toEqual(["ticker-id"]);
        const [, filter, keyframes] = animateSpy.mock.calls[0] as [
            string,
            InstanceType<typeof filters.GlowFilter>,
            { outerStrength: number[] },
            any,
        ];
        expect(filter).toBeInstanceOf(filters.GlowFilter);
        expect(keyframes.outerStrength).toEqual([0, 4, 0, 2, 0, 1, 0]);
    });
});
