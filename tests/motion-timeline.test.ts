import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import type { AnimationOptions } from "motion";
import { describe, expect, test } from "vitest";
import { timeline } from "../src/motion/utils";

/** Lets pending `.then()` microtasks (e.g. from `GroupAnimationWithThen`) settle. */
function flushMicrotasks() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Builds a driver like `motionDriver`, but without ever calling `ticker.start()`
 * (which would request a *real* `requestAnimationFrame`). Tests drive time
 * deterministically by calling `ticker.update(timestamp)` directly, which
 * invokes registered listeners regardless of the ticker's started state.
 */
function manualDriver(ticker: PIXI.Ticker): AnimationOptions["driver"] {
    return (update) => {
        const passTimestamp = ({ lastTime }: PIXI.Ticker) => update(lastTime);
        return {
            start: () => ticker.add(passTimestamp),
            stop: () => ticker.remove(passTimestamp),
            now: () => ticker.lastTime,
        };
    };
}

function createManualTicker() {
    const ticker = new PIXI.Ticker();
    ticker.autoStart = false;
    let now = 0;
    return {
        ticker,
        driver: manualDriver(ticker),
        /** Advance the ticker by `ms`, split into ~16ms steps like a real frame loop. */
        advance(ms: number) {
            const step = 16;
            let remaining = ms;
            while (remaining > 0) {
                const chunk = Math.min(step, remaining);
                now += chunk;
                ticker.update(now);
                remaining -= chunk;
            }
        },
    };
}

describe("timeline", () => {
    test("calls onPlay/onComplete once per segment, in order, when not repeating", async () => {
        const { ticker, driver, advance } = createManualTicker();
        const events: string[] = [];
        let resolved = false;

        const anim = timeline(
            [
                {
                    duration: 0.3,
                    onPlay: () => events.push("play:a"),
                    onComplete: () => events.push("complete:a"),
                },
                {
                    duration: 0.2,
                    onPlay: () => events.push("play:b"),
                    onComplete: () => events.push("complete:b"),
                },
            ],
            { ticker, driver },
        );
        anim.then(() => {
            resolved = true;
        });

        advance(600);
        await flushMicrotasks();

        expect(events).toEqual(["play:a", "complete:a", "play:b", "complete:b"]);
        expect(resolved).toBe(true);
    });

    test("does not fire onPlay/onComplete again once finished", () => {
        const { ticker, driver, advance } = createManualTicker();
        const events: string[] = [];

        timeline(
            [
                { duration: 0.1, onPlay: () => events.push("play:a") },
                { duration: 0.1, onPlay: () => events.push("play:b") },
            ],
            { ticker, driver },
        );

        advance(300);
        const countAfterFinish = events.length;
        advance(500);

        expect(events.length).toBe(countAfterFinish);
    });

    test("repeat: Infinity replays every segment exactly once per cycle and never resolves", async () => {
        const { ticker, driver, advance } = createManualTicker();
        const events: string[] = [];
        let resolved = false;

        const anim = timeline(
            [
                { duration: 1.0, onPlay: () => events.push("play:idle") },
                { duration: 0.4, onPlay: () => events.push("play:jump") },
            ],
            { repeat: Infinity, ticker, driver },
        );
        anim.then(() => {
            resolved = true;
        });

        // 4 full cycles of 1.4s each, stopping just short of the boundary to
        // land unambiguously inside the 4th cycle's "jump" segment.
        advance(1400 * 4 - 20);
        await flushMicrotasks();

        expect(events.filter((e) => e === "play:idle")).toHaveLength(4);
        expect(events.filter((e) => e === "play:jump")).toHaveLength(4);
        expect(resolved).toBe(false);

        anim.stop();
    });

    test("repeat: Infinity never fires a segment more than once per cycle (regression)", () => {
        // Regression test for the bug where onPlay was driven by a throwaway
        // MotionValue whose "change" event replayed unpredictably under
        // motion's own `repeat` handling, firing multiple times per cycle.
        const { ticker, driver, advance } = createManualTicker();
        let jumpCalls = 0;

        timeline(
            [
                { duration: 1.0, onPlay: () => {} },
                { duration: 0.4, onPlay: () => jumpCalls++ },
            ],
            { repeat: Infinity, ticker, driver },
        );

        advance(1400 * 5);

        expect(jumpCalls).toBe(5);
    });

    test("finite repeat runs exactly repeat + 1 cycles, then resolves", async () => {
        const { ticker, driver, advance } = createManualTicker();
        const events: string[] = [];
        let resolved = false;

        const anim = timeline(
            [
                { duration: 0.3, onPlay: () => events.push("play:a") },
                { duration: 0.2, onPlay: () => events.push("play:b") },
            ],
            { repeat: 2, ticker, driver },
        );
        anim.then(() => {
            resolved = true;
        });

        advance(500 * 3 + 200);
        await flushMicrotasks();

        expect(events.filter((e) => e === "play:a")).toHaveLength(3);
        expect(events.filter((e) => e === "play:b")).toHaveLength(3);
        expect(resolved).toBe(true);
    });

    test("stop() halts further onPlay/onComplete calls", () => {
        const { ticker, driver, advance } = createManualTicker();
        const events: string[] = [];

        const anim = timeline(
            [
                { duration: 1.0, onPlay: () => events.push("play:idle") },
                { duration: 0.4, onPlay: () => events.push("play:jump") },
            ],
            { repeat: Infinity, ticker, driver },
        );

        advance(1400 * 2);
        const countBeforeStop = events.length;
        anim.stop();
        advance(1400 * 3);

        expect(events.length).toBe(countBeforeStop);
    });

    test("respects delay before a segment's onPlay fires", () => {
        const { ticker, driver, advance } = createManualTicker();
        const events: { name: string; t: number }[] = [];
        let t = 0;

        timeline(
            [
                { duration: 0.2, onPlay: () => events.push({ name: "a", t }) },
                { duration: 0.2, delay: 0.3, onPlay: () => events.push({ name: "b", t }) },
            ],
            { ticker, driver },
        );

        for (let i = 0; i < 40; i++) {
            advance(16);
            t += 16;
        }

        expect(events.map((e) => e.name)).toEqual(["a", "b"]);
        // "a" plays immediately; "b" only after a's 0.2s duration + its own 0.3s
        // delay (~500ms in) — not right after "a" ends at 0.2s.
        expect(events[0].t).toBeLessThan(32);
        expect(events[1].t).toBeGreaterThanOrEqual(480);
    });
});
