import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { describe, expect, test } from "vitest";
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
