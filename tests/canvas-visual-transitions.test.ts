import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { resolveEasing } from "../src/canvas/functions/canvas-easing-utility";
import {
    applyFilterTransition,
    cleanupFilterTransition,
    snapshotLocalBounds,
    type BlurFilterConfig,
    type FilterTransitionContext,
    type IrisFilterConfig,
    type PixelateFilterConfig,
    type SplitFilterConfig,
    type WipeFilterConfig,
} from "../src/canvas/functions/canvas-filter-transition-utility";
import PixelateFilter from "../src/canvas/classes/filters/PixelateFilter";
import FilterProgressTicker from "../src/canvas/tickers/classes/FilterProgressTicker";
import { canvas } from "../src/canvas";

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

    test("split: attaches two panels that retract apart as progress grows", () => {
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

    test("blur: attaches a BlurFilter and drives its strength, removing it on cleanup", () => {
        const target = createTarget();
        const ctx: FilterTransitionContext = {};
        const config: BlurFilterConfig = { kind: "blur", quality: 4 };

        applyFilterTransition(target, config, 12, ctx);
        expect(target.filters).toHaveLength(1);
        const filter = target.filters![0] as PIXI.BlurFilter;
        expect(filter).toBeInstanceOf(PIXI.BlurFilter);
        expect(filter.strength).toBe(12);

        applyFilterTransition(target, config, 4, ctx);
        expect(target.filters).toHaveLength(1);
        expect(filter.strength).toBe(4);

        cleanupFilterTransition(target, config, ctx);
        expect(target.filters).toBeNull();
    });

    test("blur: preserves any filters already on the component", () => {
        const target = createTarget();
        const preexisting = new PIXI.AlphaFilter();
        target.filters = [preexisting];
        const ctx: FilterTransitionContext = {};
        const config: BlurFilterConfig = { kind: "blur", quality: 4 };

        applyFilterTransition(target, config, 8, ctx);
        expect(target.filters).toHaveLength(2);
        expect(target.filters).toContain(preexisting);

        cleanupFilterTransition(target, config, ctx);
        expect(target.filters).toEqual([preexisting]);
    });

    test("pixelate: attaches a PixelateFilter and drives its pixelSize, removing it on cleanup", () => {
        const target = createTarget();
        const ctx: FilterTransitionContext = {};
        const config: PixelateFilterConfig = { kind: "pixelate" };

        applyFilterTransition(target, config, 20, ctx);
        expect(target.filters).toHaveLength(1);
        const filter = target.filters![0] as PixelateFilter;
        expect(filter).toBeInstanceOf(PixelateFilter);
        expect(filter.pixelSize).toBe(20);

        cleanupFilterTransition(target, config, ctx);
        expect(target.filters).toBeNull();
    });
});

describe("FilterProgressTicker", () => {
    function tick(ms: number) {
        return { deltaMS: ms } as PIXI.Ticker;
    }

    test("interpolates from `from` to `to` over `duration` and cleans up on completion", () => {
        const target = createTarget();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const onComplete = vi.spyOn(canvas.tickers, "onComplete").mockImplementation(() => {});

        const config: BlurFilterConfig = { kind: "blur", quality: 4 };
        const ticker = new FilterProgressTicker(
            { config, from: 0, to: 20, duration: 1 },
            { canvasElementAliases: ["alias"] },
        );

        // Halfway through the duration, the filter is attached and driven to the halfway value.
        ticker.fn(tick(500), ticker.args, ["alias"], ticker.id);
        expect((target.filters![0] as PIXI.BlurFilter).strength).toBeCloseTo(10, 0);
        expect(onComplete).not.toHaveBeenCalled();

        // Once `duration` has fully elapsed, the transition applies the final value and immediately
        // cleans up in the same frame - it must never leave a lingering filter behind.
        ticker.fn(tick(500), ticker.args, ["alias"], ticker.id);
        expect(target.filters).toBeNull();
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

        const config: BlurFilterConfig = { kind: "blur", quality: 4 };
        const ticker = new FilterProgressTicker(
            { config, from: 0, to: 10, duration: 1, delay: 0.5 },
            { canvasElementAliases: ["alias"] },
        );

        ticker.fn(tick(400), ticker.args, ["alias"], ticker.id);
        expect((target.filters![0] as PIXI.BlurFilter).strength).toBe(0);
    });

    test("passes aliasToRemoveAfter/tickerIdToResume through on completion", () => {
        const target = createTarget();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const onComplete = vi.spyOn(canvas.tickers, "onComplete").mockImplementation(() => {});

        const config: PixelateFilterConfig = { kind: "pixelate" };
        const ticker = new FilterProgressTicker(
            {
                config,
                from: 32,
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

        const config: BlurFilterConfig = { kind: "blur", quality: 4 };
        const ticker = new FilterProgressTicker(
            { config, from: 0, to: 10, duration: 5 },
            { canvasElementAliases: ["alias"] },
        );

        ticker.fn(tick(16), ticker.args, ["alias"], ticker.id);
        ticker.complete();
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(target.filters).toBeNull();

        // A late frame after completion must be a no-op (no double cleanup/onComplete).
        ticker.fn(tick(16), ticker.args, ["alias"], ticker.id);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });
});
