import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { canvas } from "../src/canvas";
import MotionFilterTicker from "../src/motion/components/MotionFilterTicker";
// Side-effect import: registers "motion-filter" (and friends) with RegisteredTickers, exactly as
// CanvasManager.restore() relies on happening before it calls RegisteredTickers.getInstance().
import "../src/motion";
import RegisteredTickers from "../src/tickers/decorators/RegisteredTickers";

/**
 * `motion`'s own synchronous "write the first keyframe during construction" behavior (the root cause
 * `suppressWritesDuring` exists to guard against - see `MotionFilterTickerBase`'s and its canvas twin
 * `MotionTickerBase`'s doc comments) does not reproduce under Vitest/jsdom for either a plain object or
 * a real `BlurFilter` target - confirmed empirically, matching the same finding this session already
 * made for the canvas-element version of this bug (see the deleted `motion-ticker-resume.test.ts`).
 * That real-browser-only behavior is out of scope here (CLAUDE.md §3); these tests instead cover what
 * *is* deterministic without any ticks: the write-suppressing proxy itself, and basic construction/getter
 * sanity.
 */
describe("MotionFilterTicker", () => {
    function createTicker(filter: PIXI.BlurFilter) {
        return new MotionFilterTicker(
            { keyframes: { strength: [0, 10] }, options: { duration: 1 } },
            { filter, canvasElementAliases: [] },
        );
    }

    test("createItem() proxy reads/writes forward directly to the real filter", () => {
        const filter = new PIXI.BlurFilter({ strength: 5 });
        const ticker = createTicker(filter);
        const proxy = (ticker as any).createItem();

        expect(proxy.strength).toBe(5);
        proxy.strength = 20;
        expect(filter.strength).toBe(20);
    });

    test("suppressWritesDuring() blocks writes made through the proxy while it runs", () => {
        const filter = new PIXI.BlurFilter({ strength: 5 });
        const ticker = createTicker(filter);
        const proxy = (ticker as any).createItem();

        (ticker as any).suppressWritesDuring(() => {
            proxy.strength = 99;
        });
        expect(filter.strength).toBe(5);

        // Writes made outside suppressWritesDuring still go through normally.
        proxy.strength = 42;
        expect(filter.strength).toBe(42);
    });

    test("seeks to the saved time once the animation is constructed while resuming", () => {
        const filter = new PIXI.BlurFilter();
        const ticker = new MotionFilterTicker(
            {
                keyframes: { strength: [0, 10] },
                options: { duration: 1, repeat: Infinity },
                time: 3.5,
            },
            { filter, canvasElementAliases: [] },
        );

        expect(ticker.animation.time).toBe(3.5);
    });

    test("id and alias are set as expected", () => {
        const filter = new PIXI.BlurFilter();
        const ticker = createTicker(filter);

        expect(ticker.alias).toBe("motion-filter");
        expect(typeof ticker.id).toBe("string");
        expect(ticker.id.length).toBeGreaterThan(0);
    });

    test("args exposes the current animation time once constructed", () => {
        const filter = new PIXI.BlurFilter();
        const ticker = createTicker(filter);

        void ticker.animation;

        expect(typeof ticker.args.time).toBe("number");
    });

    test("stop() halts the underlying animation without throwing", () => {
        const filter = new PIXI.BlurFilter();
        const ticker = createTicker(filter);

        void ticker.animation;
        expect(() => ticker.stop()).not.toThrow();
    });

    test("args never exposes the live filter instance (must stay JSON-serializable)", () => {
        const filter = new PIXI.BlurFilter();
        const ticker = createTicker(filter);

        expect("filter" in ticker.args).toBe(false);
        expect(() => JSON.stringify(ticker.args)).not.toThrow();
    });

    test("pause()/play() toggle the paused state", () => {
        const filter = new PIXI.BlurFilter();
        const ticker = createTicker(filter);

        void ticker.animation;
        ticker.pause();
        expect(ticker.paused).toBe(true);
        ticker.play();
        expect(ticker.paused).toBe(false);
    });
});

/**
 * Regression coverage for a real bug: `MotionFilterTicker` could never survive
 * `CanvasManager.export()`/`restore()` (e.g. going "back" through history) because its constructor
 * required a live `Filter` instance, and a `Filter` isn't JSON-serializable - reconstruction always
 * threw, was silently swallowed by `RegisteredTickers.getInstance()`, and the animation was dropped,
 * leaving the filter frozen mid-animation (confirmed live in the sandbox: `blurIn` stuck fully
 * blurred after going back). `filterRef` (a plain `{alias, index}` pointing at
 * `canvas.find(alias).filters[index]`) lets the ticker resolve a real filter instance on
 * reconstruction, since the target component's filters are already rebuilt by the time
 * `CanvasManager.restore()` gets to reconstructing tickers.
 */
describe("MotionFilterTicker: reconstructing without a live filter (filterRef)", () => {
    afterEach(() => vi.restoreAllMocks());

    test("resolves the filter from canvas.find(alias).filters[index] when no filter/apply is passed", () => {
        const otherFilter = new PIXI.BlurFilter({ strength: 1 });
        const filter = new PIXI.BlurFilter({ strength: 7 });
        const component = { filters: [otherFilter, filter] };
        vi.spyOn(canvas, "find").mockReturnValue(component as any);

        const ticker = new MotionFilterTicker(
            {
                keyframes: { strength: [0, 10] },
                options: { duration: 1 },
                filterRef: { alias: "alias", index: 1 },
            },
            { canvasElementAliases: ["alias"] },
        );

        const proxy = (ticker as any).createItem();
        expect(proxy.strength).toBe(7);
        proxy.strength = 20;
        expect(filter.strength).toBe(20);
    });

    test("throws when filterRef doesn't resolve to anything and no filter/apply was given", () => {
        vi.spyOn(canvas, "find").mockReturnValue(undefined);

        expect(
            () =>
                new MotionFilterTicker(
                    {
                        keyframes: { strength: [0, 10] },
                        options: { duration: 1 },
                        filterRef: { alias: "missing", index: 0 },
                    },
                    { canvasElementAliases: ["missing"] },
                ),
        ).toThrow();
    });

    test("args getter re-derives filterRef.index if the filter's position in .filters changes", () => {
        const filter = new PIXI.BlurFilter({ strength: 7 });
        const component: { filters: PIXI.Filter[] } = { filters: [filter] };
        vi.spyOn(canvas, "find").mockReturnValue(component as any);

        const ticker = new MotionFilterTicker(
            {
                keyframes: { strength: [0, 10] },
                options: { duration: 1 },
                filterRef: { alias: "alias", index: 0 },
            },
            { filter, canvasElementAliases: ["alias"] },
        );

        // Something else prepends a filter on the same component, shifting ours to index 1.
        component.filters = [new PIXI.BlurFilter(), filter];
        expect(ticker.args.filterRef).toEqual({ alias: "alias", index: 1 });
    });

    test("RegisteredTickers.getInstance() - the exact call CanvasManager.restore() makes - reconstructs the ticker instead of returning undefined", () => {
        const filter = new PIXI.BlurFilter({ strength: 12 });
        const component = { filters: [filter] };
        vi.spyOn(canvas, "find").mockReturnValue(component as any);

        const ticker = RegisteredTickers.getInstance(
            "motion-filter",
            {
                keyframes: { strength: [0, 10] },
                options: { duration: 1 },
                filterRef: { alias: "alias", index: 0 },
            },
            { canvasElementAliases: ["alias"] },
        );

        expect(ticker).toBeDefined();
        const proxy = (ticker as any).createItem();
        expect(proxy.strength).toBe(12);
    });

    test("with filterRef.detach, a reconstructed ticker detaches and destroys its filter on completion", () => {
        const other = new PIXI.BlurFilter();
        const filter = new PIXI.BlurFilter();
        const destroySpy = vi.spyOn(filter, "destroy");
        const component: { filters: PIXI.Filter[] | null } = { filters: [other, filter] };
        vi.spyOn(canvas, "find").mockReturnValue(component as any);

        const ticker = new MotionFilterTicker(
            {
                keyframes: { strength: [0, 10] },
                options: { duration: 1 },
                filterRef: { alias: "alias", index: 1, detach: true },
            },
            { canvasElementAliases: ["alias"] },
        );
        // `detach` survives the args getter, so it survives the next save too.
        expect(ticker.args.filterRef).toEqual({ alias: "alias", index: 1, detach: true });

        (ticker as any).cleanup();

        expect(component.filters).toEqual([other]);
        expect(destroySpy).toHaveBeenCalledOnce();
    });

    test("without filterRef.detach, reconstruction installs no cleanup", () => {
        const filter = new PIXI.BlurFilter();
        vi.spyOn(canvas, "find").mockReturnValue({ filters: [filter] } as any);

        const ticker = new MotionFilterTicker(
            { keyframes: { strength: [0, 10] }, options: { duration: 1 }, filterRef: { alias: "alias", index: 0 } },
            { canvasElementAliases: ["alias"] },
        );

        expect((ticker as any).cleanup).toBeUndefined();
    });
});

/**
 * Regression coverage for a real bug: `motion` calls `onUpdate` with the *bare interpolated number*
 * for a single-property target (`{ value: [...] }`), not a `{ value }`-shaped object - so reading
 * `latest.value` off the callback argument silently produced `undefined` every frame, leaving
 * wipe/iris/split's mask stuck at its initial value for the *entire* animation (confirmed live in the
 * sandbox: the mask's bounds never grew past `{0,0,0,0}` before being cleaned up at completion, making
 * the whole transition look like it "did nothing"). `createUpdateHandler` now reads `target.value`
 * directly instead of trusting `onUpdate`'s own argument - verified here by calling the handler with a
 * deliberately irrelevant argument (a bare number, exactly what `motion` actually passes) and confirming
 * `apply` still receives the real value read off `target`.
 *
 * Driving `motion`'s *real* interpolation over time deterministically isn't done here: `MotionFilterTicker`
 * always lets `@motion/utils`'s `animate()` build its own `motionDriver(ticker)` (which calls the real
 * `ticker.start()`), unlike `motion-timeline.test.ts`'s hand-rolled driver that deliberately never does -
 * so manually calling `ticker.update()` doesn't reliably drive it under jsdom. That end-to-end timing
 * behavior is verified in the sandbox instead (see CLAUDE.md §3); this test targets the actual fixed
 * logic directly.
 */
describe("MotionFilterTicker: value mode (no filter)", () => {
    test("createUpdateHandler reads target.value directly, ignoring the handler's own argument", () => {
        const applyMock = vi.fn();
        const ticker = new MotionFilterTicker(
            { keyframes: { value: [0, 1] }, options: { duration: 1 } },
            { apply: applyMock, canvasElementAliases: [] },
        );
        const target = { value: 0.42 };
        const handler = (ticker as any).createUpdateHandler(target) as (latest: unknown) => void;

        // Simulates motion's real quirk: onUpdate called with a bare number, not `{ value }`.
        handler(0.999);

        expect(applyMock).toHaveBeenCalledTimes(1);
        expect(applyMock).toHaveBeenCalledWith(0.42);
    });

    test("createUpdateHandler is a no-op while stopped or paused", () => {
        const applyMock = vi.fn();
        const ticker = new MotionFilterTicker(
            { keyframes: { value: [0, 1] }, options: { duration: 1 } },
            { apply: applyMock, canvasElementAliases: [] },
        );
        const target = { value: 0.5 };
        const handler = (ticker as any).createUpdateHandler(target) as (latest: unknown) => void;

        (ticker as any).suppressWritesDuring(() => handler(undefined));
        expect(applyMock).not.toHaveBeenCalled();

        (ticker as any).stopped = true;
        handler(undefined);
        expect(applyMock).not.toHaveBeenCalled();
    });
});
