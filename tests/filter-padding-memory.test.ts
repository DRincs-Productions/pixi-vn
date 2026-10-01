import { describe, expect, test } from "vitest";
import { filters, RegisteredFilters } from "../src/filters";

describe("filter padding survives a save/restore", () => {
    test("padding is saved next to the filter's own args and applied to the restored instance", () => {
        const filter = new filters.ShockwaveFilter({ amplitude: 30 });
        filter.padding = 75;
        const memory = RegisteredFilters.toMemory((filter as any).pixivnFilterId, filter)!;

        expect(memory.padding).toBe(75);
        const restored = RegisteredFilters.getInstance(memory.filterId, memory.args, memory.padding)!;
        expect(restored.padding).toBe(75);
    });

    test("no padding is stored when it is 0", () => {
        const filter = new filters.BlurFilter({ strength: 4 });
        filter.padding = 0;
        const memory = RegisteredFilters.toMemory((filter as any).pixivnFilterId, filter)!;
        expect(memory).not.toHaveProperty("padding");
    });
});
