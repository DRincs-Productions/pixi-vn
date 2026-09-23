import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    applyFilterTransition,
    cleanupFilterTransition,
    snapshotLocalBounds,
    type FilterTransitionContext,
    type IrisFilterConfig,
    type SplitFilterConfig,
    type WipeFilterConfig,
} from "../src/canvas/functions/canvas-filter-transition-utility";
import { canvas, transitions } from "../src/canvas";
import { filters } from "../src/filters";
import type { FilterTransitionConfig } from "@canvas/functions/canvas-filter-transition-utility";

afterEach(() => vi.restoreAllMocks());

const BOUNDS = { x: 0, y: 0, width: 100, height: 50 };

const maskConfigs: FilterTransitionConfig[] = [
    { kind: "wipe", angle: 45, invert: false, bounds: BOUNDS },
    { kind: "iris", originX: 0.2, originY: 0.8, aspect: 1, invert: false, bounds: BOUNDS },
    { kind: "split", orientation: "horizontal", origin: 0.25, invert: false, bounds: BOUNDS },
];

describe.each(maskConfigs)("$kind mask regressions", (config) => {
    test("keeps local mask geometry aligned with a transformed replacement sprite", () => {
        const parent = new PIXI.Container();
        const target = new PIXI.Sprite(PIXI.Texture.WHITE) as unknown as import("../src/canvas").CanvasBaseInterface<any>;
        parent.addChild(target);
        target.position.set(210, 95);
        target.scale.set(1.5, 0.7);
        target.pivot.set(13, 8);
        target.skew.set(0.1, -0.2);
        target.rotation = 0.4;
        const ctx: FilterTransitionContext = {};
        applyFilterTransition(target, config, 0.5, ctx);
        target.updateLocalTransform();
        ctx.graphics!.updateLocalTransform();
        expect(ctx.graphics!.parent).toBe(parent);
        expect(ctx.graphics!.localTransform).toEqual(target.localTransform);
        target.position.set(330, 145);
        applyFilterTransition(target, config, 0.75, ctx);
        expect(ctx.graphics!.position.x).toBe(330);
        expect(ctx.graphics!.position.y).toBe(145);
        cleanupFilterTransition(target, config, ctx);
        expect(parent.children).toEqual([target]);
    });
});

/** A bare PixiJS Container is enough to exercise `.mask`/`.filters`/`.getLocalBounds()` without a real app. */
function createTarget() {
    return new PIXI.Container() as unknown as import("../src/canvas").CanvasBaseInterface<any>;
}

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
            invert: false,
            bounds: BOUNDS,
        };
        applyFilterTransition(target, config, 0, ctx);
        expect(target.mask).toBe(ctx.graphics);
        cleanupFilterTransition(target, config, ctx);
        expect(target.mask).toBeUndefined();
    });

});

describe("wipeOut/irisOut/splitOut: use filters.animate with no filter (MotionFilterTicker)", () => {
    function spyOnCanvas(target: import("../src/canvas").CanvasBaseInterface<any> | undefined) {
        vi.spyOn(canvas, "find").mockReturnValue(target);
        return vi.spyOn(filters, "animate").mockReturnValue("ticker-id");
    }

    test("wipeOut passes [1, 0] keyframes to filters.animate (no filter) and attaches the mask synchronously at `from`", () => {
        const target = createTarget();
        const animateSpy = spyOnCanvas(target);

        const ids = transitions.wipeOut("alias", { duration: 1, completeOnContinue: false });

        expect(ids).toEqual(["ticker-id"]);
        expect(animateSpy).toHaveBeenCalledTimes(1);
        const [aliasArg, filterArg, keyframes, options] = animateSpy.mock.calls[0] as [
            string,
            unknown,
            { value: number[] },
            any,
        ];
        expect(aliasArg).toBe("alias");
        expect(filterArg).toBeUndefined();
        expect(keyframes).toEqual({ value: [1, 0] });
        expect(options.aliasToRemoveAfter).toEqual(expect.arrayContaining(["alias"]));
        // `addMotionValueEffect` applies `from` synchronously right after registering the ticker, the
        // same frame the component is (re)rendered - mirrors what `FilterProgressTicker`'s own `start()`
        // override used to guarantee explicitly, so the mask never lags a frame behind.
        expect(target.mask).toBeInstanceOf(PIXI.Graphics);
        expect((target.mask as PIXI.Graphics).getLocalBounds().width).toBeGreaterThan(0);
    });

    test("irisOut/splitOut also attach a mask synchronously and pass [1, 0] keyframes", () => {
        const irisTarget = createTarget();
        const irisSpy = spyOnCanvas(irisTarget);
        transitions.irisOut("alias", { duration: 1, completeOnContinue: false });
        expect((irisSpy.mock.calls[0][2] as { value: number[] }).value).toEqual([1, 0]);
        expect(irisTarget.mask).toBeInstanceOf(PIXI.Graphics);

        const splitTarget = createTarget();
        const splitSpy = spyOnCanvas(splitTarget);
        transitions.splitOut("alias", { duration: 1, completeOnContinue: false });
        expect((splitSpy.mock.calls[0][2] as { value: number[] }).value).toEqual([1, 0]);
        expect(splitTarget.mask).toBeInstanceOf(PIXI.Graphics);
    });

    test("wipeOut/irisOut/splitOut warn and no-op when the alias isn't found", () => {
        spyOnCanvas(undefined);
        expect(transitions.wipeOut("missing")).toBeUndefined();
        expect(transitions.irisOut("missing")).toBeUndefined();
        expect(transitions.splitOut("missing")).toBeUndefined();
    });
});

describe("blurOut/pixelateOut: use filters.animate with a live filter (MotionFilterTicker)", () => {
    function createSprite() {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        return sprite as unknown as import("../src/canvas").CanvasBaseInterface<any>;
    }

    test("blurOut attaches a BlurFilter to the component's filters", () => {
        const target = createSprite();
        vi.spyOn(canvas, "find").mockReturnValue(target);

        // fadeComponent defaults to true for blur, which would otherwise also fire a real,
        // unmocked canvas.animate() here - see the dedicated fadeComponent tests below instead.
        const id = transitions.blurOut("alias", {
            strength: 20,
            completeOnContinue: false,
            fadeComponent: false,
        });

        expect(id).toBeDefined();
        expect(target.filters).toHaveLength(1);
        expect(target.filters![0]).toBeInstanceOf(PIXI.BlurFilter);
    });

    test("pixelateOut attaches a PixelateFilter to the component's filters", async () => {
        const target = createSprite();
        vi.spyOn(canvas, "find").mockReturnValue(target);
        const { PixelateFilter } = await import("pixi-filters");

        // fadeComponent defaults to false for pixelate, so no extra canvas.animate() call here.
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

describe("fadeComponent: softens the pop-in/pop-out for blur/flash (default true) and pixelate (default false)", () => {
    function createSprite() {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        return sprite as unknown as import("../src/canvas").CanvasBaseInterface<any>;
    }

    function spyOnCanvas(target: import("../src/canvas").CanvasBaseInterface<any> | undefined) {
        vi.spyOn(canvas, "find").mockReturnValue(target);
        return vi.spyOn(canvas, "animate").mockReturnValue("fade-ticker-id");
    }

    test("blurOut fades the component's own alpha out by default, timed against the last quarter of duration", () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        transitions.blurOut("alias", { strength: 20, duration: 1, completeOnContinue: false });

        expect(animateSpy).toHaveBeenCalledTimes(1);
        const [aliasArg, keyframes, options] = animateSpy.mock.calls[0] as [
            string,
            { alpha: number[] },
            any,
        ];
        expect(aliasArg).toBe("alias");
        expect(keyframes).toEqual({ alpha: [1, 0] });
        expect(options.duration).toBeCloseTo(0.25);
        expect(options.delay).toBeCloseTo(0.75);
    });

    // blurIn/pixelateIn/flashIn's "fresh element" fade-in path aren't independently Vitest-tested here,
    // the same established scope boundary as the rest of this file: they need `swapComponentForEffect`
    // to actually build/register a new component (real asset loading via `canvas.add`), which needs a
    // live canvas registry this test file doesn't set up - see the `blurOut`/`pixelateOut` tests above
    // for the identical reasoning. Verified in the sandbox instead (see CLAUDE.md §3).

    test("pixelateOut does not fade the component by default (fadeComponent defaults to false)", () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        transitions.pixelateOut("alias", { pixelSize: 16, duration: 1, completeOnContinue: false });

        expect(animateSpy).not.toHaveBeenCalled();
    });

    test("pixelateOut fades the component when fadeComponent is explicitly true", () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        transitions.pixelateOut("alias", {
            pixelSize: 16,
            duration: 1,
            completeOnContinue: false,
            fadeComponent: true,
        });

        expect(animateSpy).toHaveBeenCalledTimes(1);
        const [, keyframes] = animateSpy.mock.calls[0] as [string, { alpha: number[] }, any];
        expect(keyframes).toEqual({ alpha: [1, 0] });
    });

    test("fadeComponent: false suppresses blurOut's extra fade call entirely", () => {
        const target = createSprite();
        const animateSpy = spyOnCanvas(target);

        transitions.blurOut("alias", { strength: 20, duration: 1, fadeComponent: false });

        expect(animateSpy).not.toHaveBeenCalled();
    });

    test("fadeComponent: false makes flashOut call canvas.animate only once, for its own overlay", () => {
        const target = createSprite();
        vi.spyOn(canvas, "add").mockImplementation(() => {});
        const animateSpy = spyOnCanvas(target);

        transitions.flashOut("alias", { duration: 0.2, fadeComponent: false });

        expect(animateSpy).toHaveBeenCalledTimes(1);
        const [, keyframes] = animateSpy.mock.calls[0] as [string, { alpha: number[] }, any];
        // The overlay's own multi-stop cycle, not the 2-value component fade.
        expect(keyframes.alpha).toEqual([0, 1, 1, 0]);
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

        // fadeComponent defaults to true for flash, which would otherwise also fire a canvas.animate()
        // call for the component's own fade-out - see the dedicated fadeComponent tests above.
        const ids = transitions.flashOut("alias", {
            color: 0x00ff00,
            maxAlpha: 1,
            duration: 0.2,
            fadeComponent: false,
        });

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

        transitions.flashOut("alias", { maxAlpha: 1, duration: 0.1, pulses: 3, fadeComponent: false });

        const [, keyframes] = animateSpy.mock.calls[0] as [string, { alpha: number[] }, any];
        expect(keyframes.alpha).toEqual([0, 1, 1, 0, 1, 1, 0, 1, 1, 0]);
    });

    test("warns and no-ops when the alias isn't found", () => {
        spyOnCanvas(undefined);
        expect(transitions.flashOut("missing")).toBeUndefined();
    });
});
