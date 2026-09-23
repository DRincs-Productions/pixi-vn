import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { describe, expect, test, vi } from "vitest";
import MotionFilterTicker from "../src/motion/components/MotionFilterTicker";

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
