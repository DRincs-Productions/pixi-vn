import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { resolveEasing } from "../src/canvas/functions/canvas-easing-utility";
import {
    applyFilterTransition,
    cleanupFilterTransition,
    snapshotLocalBounds,
    type FilterTransitionContext,
    type IrisFilterConfig,
    type SplitFilterConfig,
    type WipeFilterConfig,
} from "../src/canvas/functions/canvas-filter-transition-utility";
import FilterProgressTicker from "../src/canvas/tickers/classes/FilterProgressTicker";
import { canvas, transitions } from "../src/canvas";

afterEach(() => vi.restoreAllMocks());

const BOUNDS = { x: 0, y: 0, width: 100, height: 50 };

/** A bare PixiJS Container is enough to exercise `.mask`/`.filters`/`.getLocalBounds()` without a real app. */
function createTarget() {
    return new PIXI.Container() as unknown as import("../src/canvas").CanvasBaseInterface<any>;
}

describe("resolveEasing", () => {
    test("resolves named eases", () => {
        expect(resolveEasing("linear")(0.5)).toBeCloseTo(0.5);
        expect(resolveEasing("easeIn")(0.5)).toBeCloseTo(0.25);
        expect(resolveEasing(undefined)(0.5)).toBeCloseTo(0.5);
    });

    test("resolves a cubic-bezier array, clamping the endpoints", () => {
        const ease = resolveEasing([0.42, 0, 0.58, 1]);
        expect(ease(0)).toBeCloseTo(0);
        expect(ease(1)).toBeCloseTo(1);
    });

    test("resolves a custom function and unwraps a single-element array", () => {
        const custom = (t: number) => t * t;
        expect(resolveEasing(custom)(0.5)).toBeCloseTo(0.25);
        expect(resolveEasing([custom])(0.5)).toBeCloseTo(0.25);
    });

    test("falls back to linear for unrecognized input", () => {
        expect(resolveEasing("not-a-real-ease")(0.3)).toBeCloseTo(0.3);
    });
});

describe("snapshotLocalBounds", () => {
    test("reads x/y/width/height off the component's own local bounds", () => {
        const target = createTarget();
        (target as unknown as PIXI.Container).addChild(
            new PIXI.Graphics().rect(0, 0, 100, 50).fill(0xffffff),
        );
        expect(snapshotLocalBounds(target)).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    });
});

describe("applyFilterTransition / cleanupFilterTransition", () => {
    test("wipe: attaches a mask that grows with progress and is fully removed on cleanup", () => {
        const target = createTarget();
        const ctx: FilterTransitionContext = {};
        const config: WipeFilterConfig = {
            kind: "wipe",
            angle: 0,
            softness: 0,
            invert: false,
            bounds: BOUNDS,
        };

        applyFilterTransition(target, config, 0, ctx);
        expect(target.mask).toBe(ctx.graphics);
        expect(ctx.graphics).toBeInstanceOf(PIXI.Graphics);

        applyFilterTransition(target, config, 1, ctx);
        expect(target.mask).toBe(ctx.graphics);

        cleanupFilterTransition(target, config, ctx);
        expect(target.mask).toBeUndefined();
        expect(ctx.graphics).toBeUndefined();
    });

    test("wipe: invert flips which side of progress is masked in", () => {
        const target = createTarget();
        const ctx: FilterTransitionContext = {};
        const base: WipeFilterConfig = {
            kind: "wipe",
            angle: 0,
            softness: 0,
            invert: false,
            bounds: BOUNDS,
        };
        applyFilterTransition(target, base, 0.25, ctx);
        const normalBounds = ctx.graphics!.getLocalBounds();

        const ctxInverted: FilterTransitionContext = {};
        applyFilterTransition(target, { ...base, invert: true }, 0.75, ctxInverted);
        const invertedBounds = ctxInverted.graphics!.getLocalBounds();

        // invert=true at 0.75 should draw the same size mask as invert=false at (1 - 0.75) = 0.25.
        expect(invertedBounds.width).toBeCloseTo(normalBounds.width);
    });

    test("iris: attaches a growing radial mask and cleans it up", () => {
        const target = createTarget();
        const ctx: FilterTransitionContext = {};
        const config: IrisFilterConfig = {
            kind: "iris",
            originX: 0.5,
            originY: 0.5,
            aspect: 1,
            softness: 0,
            invert: false,
            bounds: BOUNDS,
        };
        applyFilterTransition(target, config, 0.5, ctx);
        expect(target.mask).toBe(ctx.graphics);
        cleanupFilterTransition(target, config, ctx);
        expect(target.mask).toBeUndefined();
    });

    test("split: attaches two panels that slide together as progress grows", () => {
        const target = createTarget();
        const ctx: FilterTransitionContext = {};
        const config: SplitFilterConfig = {
            kind: "split",
            orientation: "vertical",
            origin: 0.5,
            softness: 0,
            invert: false,
            bounds: BOUNDS,
        };
        applyFilterTransition(target, config, 0, ctx);
        expect(target.mask).toBe(ctx.graphics);
        cleanupFilterTransition(target, config, ctx);
        expect(target.mask).toBeUndefined();
    });

});

describe("FilterProgressTicker", () => {
    function tick(ms: number) {
        return { deltaMS: ms } as PIXI.Ticker;
    }

    function wipeConfig(): WipeFilterConfig {
        return { kind: "wipe", angle: 0, softness: 0, invert: false, bounds: BOUNDS };
    }

    test("interpolates from `from` to `to` over `duration` and cleans up on completion", () => {
        const target = createTarget();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const onComplete = vi.spyOn(canvas.tickers, "onComplete").mockImplementation(() => {});

        const ticker = new FilterProgressTicker(
            { config: wipeConfig(), from: 0, to: 1, duration: 1 },
            { canvasElementAliases: ["alias"] },
        );

        // Halfway through the duration, the mask is attached and revealing about half the width.
        ticker.fn(tick(500), ticker.args, ["alias"], ticker.id);
        expect(target.mask).toBeInstanceOf(PIXI.Graphics);
        const halfwayWidth = (target.mask as PIXI.Graphics).getLocalBounds().width;
        expect(halfwayWidth).toBeGreaterThan(0);
        expect(onComplete).not.toHaveBeenCalled();

        // Once `duration` has fully elapsed, the transition applies the final value and immediately
        // cleans up in the same frame - it must never leave a lingering mask behind.
        ticker.fn(tick(500), ticker.args, ["alias"], ticker.id);
        expect(target.mask).toBeUndefined();
        expect(onComplete).toHaveBeenCalledWith(ticker.id, {
            aliasToRemoveAfter: [],
            tickerAliasToResume: [],
            tickerIdToResume: [],
            stopTicker: true,
        });
    });

    test("honors delay before the value starts changing", () => {
        const target = createTarget();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        vi.spyOn(canvas.tickers, "onComplete").mockImplementation(() => {});

        const ticker = new FilterProgressTicker(
            { config: wipeConfig(), from: 0, to: 1, duration: 1, delay: 0.5 },
            { canvasElementAliases: ["alias"] },
        );

        ticker.fn(tick(400), ticker.args, ["alias"], ticker.id);
        // Still before the delay has elapsed: nothing revealed yet.
        expect((target.mask as PIXI.Graphics).getLocalBounds().width).toBe(0);
    });

    test("passes aliasToRemoveAfter/tickerIdToResume through on completion", () => {
        const target = createTarget();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const onComplete = vi.spyOn(canvas.tickers, "onComplete").mockImplementation(() => {});

        const ticker = new FilterProgressTicker(
            {
                config: wipeConfig(),
                from: 0,
                to: 1,
                duration: 0.1,
                aliasToRemoveAfter: ["old_temp"],
                tickerIdToResume: ["paused-ticker"],
            },
            { canvasElementAliases: ["alias"] },
        );

        ticker.fn(tick(200), ticker.args, ["alias"], ticker.id);
        expect(onComplete).toHaveBeenCalledWith(ticker.id, {
            aliasToRemoveAfter: ["old_temp"],
            tickerAliasToResume: [],
            tickerIdToResume: ["paused-ticker"],
            stopTicker: true,
        });
    });

    test("complete() forces immediate finish exactly once", () => {
        const target = createTarget();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const onComplete = vi.spyOn(canvas.tickers, "onComplete").mockImplementation(() => {});

        const ticker = new FilterProgressTicker(
            { config: wipeConfig(), from: 0, to: 1, duration: 5 },
            { canvasElementAliases: ["alias"] },
        );

        ticker.fn(tick(16), ticker.args, ["alias"], ticker.id);
        ticker.complete();
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(target.mask).toBeUndefined();

        // A late frame after completion must be a no-op (no double cleanup/onComplete).
        ticker.fn(tick(16), ticker.args, ["alias"], ticker.id);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });
});

describe("blurOut/pixelateOut: use canvas.animateFilter (MotionFilterTicker)", () => {
    function createSprite() {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        return sprite as unknown as import("../src/canvas").CanvasBaseInterface<any>;
    }

    test("blurOut attaches a BlurFilter to the component's filters", () => {
        const target = createSprite();
        vi.spyOn(canvas, "find").mockReturnValue(target);

        const id = transitions.blurOut("alias", { strength: 20, completeOnContinue: false });

        expect(id).toBeDefined();
        expect(target.filters).toHaveLength(1);
        expect(target.filters![0]).toBeInstanceOf(PIXI.BlurFilter);
    });

    test("pixelateOut attaches a PixelateFilter to the component's filters", async () => {
        const target = createSprite();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const { PixelateFilter } = await import("pixi-filters");

        const id = transitions.pixelateOut("alias", { pixelSize: 16, completeOnContinue: false });

        expect(id).toBeDefined();
        expect(target.filters).toHaveLength(1);
        expect(target.filters![0]).toBeInstanceOf(PixelateFilter);
    });

    test("blurOut/pixelateOut warn and no-op when the alias isn't found", () => {
        vi.spyOn(canvas, "find").mockReturnValue(undefined);
        expect(transitions.blurOut("missing")).toBeUndefined();
        expect(transitions.pixelateOut("missing")).toBeUndefined();
    });
});

describe("flashOut: overlay runs the full up/down cycle, then the element is removed with a hard cut", () => {
    function createSprite() {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        return sprite as unknown as import("../src/canvas").CanvasBaseInterface<any>;
    }

    /** `flashOut` never needs the overlay to actually resolve through the canvas registry to be
     * exercised: everything worth asserting on is the keyframes/options it hands to `canvas.animate`,
     * so `add`/`animate` are stubbed rather than left to run for real (which - like `flashIn`'s own
     * asset-loading path - would need a live canvas registry this test file doesn't otherwise set up;
     * see the `blurOut`/`pixelateOut` tests above for the same reasoning). */
    function spyOnCanvas(target: import("../src/canvas").CanvasBaseInterface<any> | undefined) {
        vi.spyOn(canvas, "find").mockReturnValue(target);
        vi.spyOn(canvas, "add").mockImplementation(() => {});
        return vi.spyOn(canvas, "animate").mockReturnValue("ticker-id");
    }

    test("a single pulse fades 0 -> maxAlpha -> 0, then removes the overlay and the target together", () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        const ids = transitions.flashOut("alias", { color: 0x00ff00, maxAlpha: 1, duration: 0.2 });

        expect(ids).toEqual(["ticker-id"]);
        expect(animateSpy).toHaveBeenCalledTimes(1);
        const [, keyframes, options] = animateSpy.mock.calls[0] as [string, { alpha: number[] }, any];
        // Full cycle: fades up to the peak, holds (holdDuration=0, so a duplicate value/no-op hold), then
        // fades back down to 0 (normal) before the ticker completes and the element is removed - the
        // removal itself (via aliasToRemoveAfter) is a direct, non-animated cut, not a further dissolve.
        expect(keyframes.alpha).toEqual([0, 1, 1, 0]);
        expect(options.aliasToRemoveAfter).toEqual(expect.arrayContaining(["alias"]));
    });

    test("multiple pulses flicker normally, and the last one also fades back down before removal", () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        transitions.flashOut("alias", { maxAlpha: 1, duration: 0.1, pulses: 3 });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { alpha: number[] }, any];
        expect(keyframes.alpha).toEqual([0, 1, 1, 0, 1, 1, 0, 1, 1, 0]);
    });

    test("warns and no-ops when the alias isn't found", () => {
        spyOnCanvas(undefined);
        expect(transitions.flashOut("missing")).toBeUndefined();
    });
});
