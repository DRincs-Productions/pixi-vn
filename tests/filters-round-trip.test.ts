import { describe, expect, test } from "vitest";
import { RegisteredFilters } from "../src/filters";

/**
 * Generic, per-filter coverage for every built-in registration in `register-builtin-filters.ts`. Rather
 * than hardcoding expected property values for 38+ filters (fragile, and doesn't scale as more get
 * registered), this checks *self-consistency*: constructing a filter with its own defaults, exporting
 * it to memory, reconstructing a new instance from that memory, and exporting *that* instance too must
 * produce the exact same `args` both times. That's the actual guarantee save/restore depends on - if a
 * filter's `toMemory`/constructor pairing were lossy or inconsistent, the second export would differ
 * from the first.
 *
 * `GlitchFilter`'s constructor draws onto a scratch `<canvas>` (2D context) to build its displacement
 * texture - `jsdom` doesn't implement `getContext("2d")` (see the "Not implemented" warnings this whole
 * suite already logs), so it can't even be constructed here, let alone round-tripped. Its registration
 * is still exercised for real in the sandbox (a real browser has a real 2D context) - see CLAUDE.md §3.
 */
const JSDOM_UNCONSTRUCTABLE = new Set(["GlitchFilter"]);

describe("RegisteredFilters: every built-in filter round-trips", () => {
    const ids = RegisteredFilters.keys();

    test("has registered every expected built-in filter", () => {
        // 3 from pixi.js core (BlurFilter, AlphaFilter, NoiseFilter) + 35 from pixi-filters.
        expect(ids.length).toBe(38);
    });

    test.each(ids.filter((id) => !JSDOM_UNCONSTRUCTABLE.has(id)))(
        "%s: export -> reconstruct -> export again yields identical args",
        (filterId) => {
            const FilterClass = RegisteredFilters.get(filterId);
            expect(FilterClass).toBeDefined();

            const original = new (FilterClass as new (args?: any) => any)();
            const firstMemory = RegisteredFilters.toMemory(filterId, original);
            expect(firstMemory).toBeDefined();
            expect(firstMemory?.filterId).toBe(filterId);

            const restored = RegisteredFilters.getInstance(filterId, firstMemory?.args);
            expect(restored).toBeInstanceOf(FilterClass);

            const secondMemory = RegisteredFilters.toMemory(filterId, restored);
            expect(secondMemory?.args).toEqual(firstMemory?.args);
        },
    );
});
