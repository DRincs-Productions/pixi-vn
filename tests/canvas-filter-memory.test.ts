import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { AdjustmentFilter, PixelateFilter } from "pixi-filters";
import { afterEach, describe, expect, test, vi } from "vitest";
import Container from "../src/canvas/components/Container";
import RegisteredFilters, { filterDecorator } from "../src/filters/decorators/RegisteredFilters";
import { logger } from "../src/utils/log-utility";

afterEach(() => vi.restoreAllMocks());

/**
 * Coverage for saving/restoring a canvas element's current `.filters` state - the actual feature this
 * session added, exercised end to end (not just the registry in isolation): attach real, built-in
 * filters to a real Pixi'VN `Container`, read its `.memory`, and confirm a *different* `Container`
 * restored from that memory ends up with equivalent filters, not just the same reference.
 */
describe("canvas element filters: save/restore", () => {
    test("round-trips a single built-in filter (BlurFilter) through memory", async () => {
        const original = new Container();
        original.filters = [new PIXI.BlurFilter({ strengthX: 4, strengthY: 6, quality: 3 })];

        const memory = original.memory;
        expect(memory.pixivnFilters).toEqual([
            {
                filterId: "BlurFilter",
                args: { strengthX: 4, strengthY: 6, quality: 3, repeatEdgePixels: false },
            },
        ]);

        const restored = new Container();
        await restored.setMemory(memory);

        expect(restored.filters).toHaveLength(1);
        const filter = (restored.filters as PIXI.BlurFilter[])[0];
        expect(filter).toBeInstanceOf(PIXI.BlurFilter);
        expect(filter.strengthX).toBe(4);
        expect(filter.strengthY).toBe(6);
        expect(filter.quality).toBe(3);
    });

    test("round-trips multiple filters from different sources (pixi.js core + pixi-filters)", async () => {
        const original = new Container();
        original.filters = [
            new PIXI.BlurFilter({ strengthX: 2, strengthY: 2, quality: 4 }),
            new PixelateFilter([8, 12]),
            new AdjustmentFilter({ gamma: 1.5, contrast: 0.8, brightness: 1.1 }),
        ];

        const memory = original.memory;
        expect(memory.pixivnFilters).toHaveLength(3);
        expect(memory.pixivnFilters?.map((f) => f.filterId)).toEqual([
            "BlurFilter",
            "PixelateFilter",
            "AdjustmentFilter",
        ]);

        const restored = new Container();
        await restored.setMemory(memory);

        expect(restored.filters).toHaveLength(3);
        const [blur, pixelate, adjustment] = restored.filters as [
            PIXI.BlurFilter,
            PixelateFilter,
            AdjustmentFilter,
        ];
        expect(blur).toBeInstanceOf(PIXI.BlurFilter);
        expect(blur.strengthX).toBe(2);
        expect(pixelate).toBeInstanceOf(PixelateFilter);
        expect(pixelate.sizeX).toBe(8);
        expect(pixelate.sizeY).toBe(12);
        expect(adjustment).toBeInstanceOf(AdjustmentFilter);
        expect(adjustment.gamma).toBe(1.5);
        expect(adjustment.contrast).toBeCloseTo(0.8);
        expect(adjustment.brightness).toBeCloseTo(1.1);
    });

    test("a project's own custom filter round-trips once registered with filterDecorator", async () => {
        class TintPulseFilter extends PIXI.ColorMatrixFilter {
            intensity: number;
            constructor(args: { intensity?: number } = {}) {
                super();
                this.intensity = args.intensity ?? 1;
            }
        }
        filterDecorator({ toMemory: (filter: TintPulseFilter) => ({ intensity: filter.intensity }) })(
            TintPulseFilter,
        );

        const original = new Container();
        original.filters = [new TintPulseFilter({ intensity: 0.42 })];

        const memory = original.memory;
        expect(memory.pixivnFilters).toEqual([
            { filterId: "TintPulseFilter", args: { intensity: 0.42 } },
        ]);

        const restored = new Container();
        await restored.setMemory(memory);

        expect(restored.filters).toHaveLength(1);
        const filter = (restored.filters as TintPulseFilter[])[0];
        expect(filter).toBeInstanceOf(TintPulseFilter);
        expect(filter.intensity).toBe(0.42);
    });

    test("skips an unregistered filter on export, with a warning, instead of throwing", () => {
        const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});
        const original = new Container();
        original.filters = [new PIXI.ColorMatrixFilter()];

        const memory = original.memory;

        expect(memory.pixivnFilters).toEqual([]);
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    test("preserves filter order across the round-trip", async () => {
        const original = new Container();
        original.filters = [
            new PixelateFilter(4),
            new PIXI.BlurFilter({ strength: 1 }),
            new PixelateFilter(9),
        ];

        const restored = new Container();
        await restored.setMemory(original.memory);

        const filters = restored.filters as (PixelateFilter | PIXI.BlurFilter)[];
        expect(filters).toHaveLength(3);
        expect(filters[0]).toBeInstanceOf(PixelateFilter);
        expect((filters[0] as PixelateFilter).sizeX).toBe(4);
        expect(filters[1]).toBeInstanceOf(PIXI.BlurFilter);
        expect(filters[2]).toBeInstanceOf(PixelateFilter);
        expect((filters[2] as PixelateFilter).sizeX).toBe(9);
    });

    test("a container with no filters round-trips with pixivnFilters left unset", async () => {
        const original = new Container();

        const memory = original.memory;
        expect(memory.pixivnFilters).toBeUndefined();

        const restored = new Container();
        await restored.setMemory(memory);
        expect(restored.filters).toBeFalsy();
    });

    test("RegisteredFilters.getInstance() returns undefined and logs for an unknown filterId", () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
        const instance = RegisteredFilters.getInstance("NotARealFilter", {});
        expect(instance).toBeUndefined();
        expect(errorSpy).toHaveBeenCalledOnce();
    });
});
