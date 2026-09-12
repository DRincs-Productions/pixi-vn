import { expect, test } from "vitest";
import { narration, newLabel, storage, stepHistory } from "../src";

/**
 * Informational benchmark, not a strict pass/fail gate on absolute timing (that would be
 * flaky across machines/CI). It exists to compare relative cost before/after changes to
 * HistoryManager's clone strategy - run with `npx vitest run tests/history-perf.test.ts`
 * and read the console output.
 */

function buildLongLabel(stepCount: number) {
    const steps = Array.from({ length: stepCount }, (_, i) => async () => {
        narration.dialogue = `Line number ${i} of a reasonably long paragraph of narration text, meant to stand in for real dialogue content players would actually read.`;
    });
    return newLabel(`perf-label-${stepCount}`, steps);
}

test("stepHistory.back() timing with a realistically-sized game state", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    // Simulate an accumulated playthrough: lots of storage variables (flags, counters,
    // relationship values, inventory, etc.) - the kind of thing that grows over a real game.
    // Sized up well beyond a typical playthrough to get a clean signal-to-noise ratio for
    // comparing clone strategies - the exact absolute numbers here won't match a real
    // browser tab (jsdom, no real canvas/sound state), but the relative before/after
    // improvement should carry over since it's the same JSON-stringify-based clone doing
    // proportionally more work.
    for (let i = 0; i < 5000; i++) {
        storage.set(`var_${i}`, i % 2 === 0 ? `value-${i}-${"x".repeat(20)}` : i);
    }

    const label = buildLongLabel(200);
    await narration.call(label, {});
    for (let i = 0; i < 150; i++) {
        await narration.continue({});
    }

    expect(stepHistory.canGoBack).toBe(true);

    const timings: number[] = [];
    for (let i = 0; i < 20; i++) {
        const start = performance.now();
        await stepHistory.back({});
        timings.push(performance.now() - start);
    }

    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const max = Math.max(...timings);
    // biome-ignore lint/suspicious/noConsole: intentional benchmark output
    console.log(
        `stepHistory.back() over ${timings.length} calls: avg=${avg.toFixed(2)}ms max=${max.toFixed(2)}ms`,
        timings.map((t) => t.toFixed(1)),
    );

    // Loose sanity bound, not a tight perf assertion - just catches gross regressions
    // (e.g. an accidental O(n^2)) without being flaky on slower CI hardware.
    expect(avg).toBeLessThan(500);
}, 30000);
