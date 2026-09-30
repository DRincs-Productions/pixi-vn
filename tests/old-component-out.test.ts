import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { canvas, transitions } from "../src/canvas";
import { filters } from "../src/filters";
import { tickers } from "../src/tickers";

/**
 * `animateOldComponentOut`: when an `xIn` replaces an existing element, the replaced one leaves with the
 * matching `xOut` (started together with the in) instead of just waiting under the new one.
 */
describe("animateOldComponentOut", () => {
    const elements = new Map<string, any>();

    function sprite() {
        return new PIXI.Sprite(PIXI.Texture.WHITE) as any;
    }

    beforeEach(() => {
        elements.clear();
        elements.set("alias", sprite());
        vi.spyOn(canvas, "find").mockImplementation((alias: string) => elements.get(alias));
        vi.spyOn(canvas, "editAlias").mockImplementation((from: string, to: string) => {
            elements.set(to, elements.get(from));
            elements.delete(from);
        });
        vi.spyOn(canvas, "add").mockImplementation((alias: string, element: any) => {
            elements.set(alias, element);
        });
        vi.spyOn(canvas, "copyCanvasElementProperty").mockImplementation(() => {});
        vi.spyOn(tickers, "transfer").mockImplementation(() => {});
        vi.spyOn(tickers, "completeOnStepEnd").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function spyFilters() {
        let n = 0;
        return vi.spyOn(filters, "animate").mockImplementation(() => `ticker-${n++}`);
    }

    test.each([undefined, 180, -180, 0])("twistIn angle %s: replacement rotates both images in the same sense", async (angle) => {
        const spy = spyFilters();
        await transitions.twistIn("alias", sprite(), { angle, fadeComponent: false });
        const incoming = spy.mock.calls.find((c) => c[0] === "alias")!;
        const outgoing = spy.mock.calls.find((c) => c[0] === "alias_temp_twist")!;
        const wound = ((angle ?? 540) * Math.PI) / 180;
        expect((incoming[2] as any).angle).toEqual([wound, 0]);
        expect((outgoing[2] as any).angle).toEqual([0, -wound]);
        expect((outgoing[3] as any).aliasToRemoveAfter).toContain("alias_temp_twist");
    });

    test.each([undefined, "inward", "outward"] as const)("splitIn direction %s: replacement uses complementary masks", async (direction) => {
        const spy = spyFilters();
        await transitions.splitIn("alias", sprite(), { direction, orientation: "horizontal", origin: 0.25 });
        const incoming = spy.mock.calls.find((c) => c[0] === "alias")!;
        const outgoing = spy.mock.calls.find((c) => c[0] === "alias_temp_split")!;
        expect((incoming[7] as any).config).toMatchObject({ direction: direction ?? "inward", orientation: "horizontal", origin: 0.25 });
        expect((outgoing[7] as any).config).toMatchObject({ direction: direction === "outward" ? "inward" : "outward", origin: 0.25 });
        expect(incoming[2]).toEqual({ value: [0, 1] });
        expect(outgoing[2]).toEqual({ value: [1, 0] });
        expect((outgoing[3] as any).aliasToRemoveAfter).toContain("alias_temp_split");
    });

    test.each([
        [undefined, 1, 1],
        ["up-left", 1, 1],
        ["up-right", -1, 1],
        ["down-left", 1, -1],
        ["down-right", -1, -1],
    ] as const)("pixelateIn direction %s: replacement keeps both components drifting together", async (direction, x, y) => {
        const spy = spyFilters();
        await transitions.pixelateIn("alias", sprite(), { direction, pixelSize: 24 });

        const incoming = spy.mock.calls.find((c) => c[0] === "alias")!;
        const outgoing = spy.mock.calls.find((c) => c[0] === "alias_temp_pixelate")!;
        expect(incoming[2]).toEqual({ sizeX: [24 * x, x], sizeY: [24 * y, y] });
        expect(outgoing[2]).toEqual({ sizeX: [-x, -24 * x], sizeY: [-y, -24 * y] });
        // Filters must already have their first keyframe before any animation tick or render.
        expect((incoming[1] as any).sizeX).toBe(24 * x);
        expect((incoming[1] as any).sizeY).toBe(24 * y);
        expect((outgoing[1] as any).sizeX).toBe(-x);
        expect((outgoing[1] as any).sizeY).toBe(-y);
        expect((outgoing[3] as any).aliasToRemoveAfter).toContain("alias_temp_pixelate");
    });

    test("pixelateIn can leave the old component untouched", async () => {
        const spy = spyFilters();
        await transitions.pixelateIn("alias", sprite(), { direction: "down-right", animateOldComponentOut: false });
        expect(spy).toHaveBeenCalledTimes(1);
        expect((spy.mock.calls[0][3] as any).aliasToRemoveAfter).toContain("alias_temp_pixelate");
    });

    test("wipeIn: by default the replaced element leaves with wipeOut, from the opposite side", async () => {
        const spy = spyFilters();
        const ids = await transitions.wipeIn("alias", sprite(), { duration: 1 });

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy.mock.calls.map((c) => c[0]).sort()).toEqual(["alias", "alias_temp_wipe"]);
        expect(ids).toHaveLength(2);
        // The old element's own ticker removes it, nothing is left waiting on the new element's one.
        const newOptions = spy.mock.calls.find((c) => c[0] === "alias")![3] as any;
        expect(newOptions.aliasToRemoveAfter ?? []).not.toContain("alias_temp_wipe");
        const oldOptions = spy.mock.calls.find((c) => c[0] === "alias_temp_wipe")![3] as any;
        expect(oldOptions.aliasToRemoveAfter).toContain("alias_temp_wipe");
    });

    test("wipeIn: animateOldComponentOut false leaves the replaced element untouched until the in ends", async () => {
        const spy = spyFilters();
        const ids = await transitions.wipeIn("alias", sprite(), { animateOldComponentOut: false });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(ids).toHaveLength(1);
        expect((spy.mock.calls[0][3] as any).aliasToRemoveAfter).toContain("alias_temp_wipe");
    });

    test("wipeIn without a replaced element only runs the in animation", async () => {
        elements.clear();
        const spy = spyFilters();
        await transitions.wipeIn("alias", sprite());
        expect(spy).toHaveBeenCalledTimes(1);
    });

    test("irisIn: the replaced element leaves with the opposite circle (grows -> hole that grows)", async () => {
        const spy = spyFilters();
        await transitions.irisIn("alias", sprite(), { duration: 1 });

        expect(spy).toHaveBeenCalledTimes(2);
        const inValues = (spy.mock.calls.find((c) => c[0] === "alias")![2] as any).value;
        const outValues = (spy.mock.calls.find((c) => c[0] === "alias_temp_iris")![2] as any).value;
        // in: circle grows 0 -> 1 (image seen through it). out: hole grows 0 -> 1 (image seen around it).
        expect(inValues).toEqual([0, 1]);
        expect(outValues).toEqual([0, 1]);
    });

    test("irisIn direction contract: a hole shrinks until the whole image is shown", async () => {
        elements.clear();
        const spy = spyFilters();
        await transitions.irisIn("alias", sprite(), { direction: "contract" });
        expect((spy.mock.calls[0][2] as any).value).toEqual([1, 0]);
    });

    test("irisOut direction contract: the hole grows until the image is gone", () => {
        const spy = spyFilters();
        transitions.irisOut("alias", { direction: "contract" });
        expect((spy.mock.calls[0][2] as any).value).toEqual([0, 1]);
    });

    test("tvIn: the new element only starts once the replaced one has finished turning off", async () => {
        const animate = vi.spyOn(canvas, "animate").mockReturnValue("canvas-ticker");
        const spy = spyFilters();
        await transitions.tvIn("alias", sprite(), { duration: 2 });

        // The old element's tvOut (canvas.animate on "alias_temp_tv") has no delay...
        const oldCall = animate.mock.calls.find((c) => c[0] === "alias_temp_tv");
        expect(oldCall).toBeDefined();
        expect((oldCall![2] as any).delay).toBeUndefined();
        // ...and every ticker of the new element is delayed by the old one's duration.
        const newCall = animate.mock.calls.find((c) => c[0] === "alias");
        expect((newCall![2] as any).delay).toBe(2);
        const newFilterCalls = spy.mock.calls.filter((c) => c[0] === "alias");
        expect(newFilterCalls.length).toBeGreaterThan(0);
        for (const call of newFilterCalls) {
            expect((call[3] as any).delay).toBe(2);
        }
    });

    test("rippleIn: the replaced element is dissolved, together with the in", async () => {
        const spy = spyFilters();
        const animate = vi.spyOn(canvas, "animate").mockReturnValue("canvas-ticker");
        await transitions.rippleIn("alias", sprite(), { duration: 1 });

        const dissolve = animate.mock.calls.find((c) => c[0] === "alias_temp_ripple");
        expect(dissolve).toBeDefined();
        expect((dissolve![1] as any).alpha).toBe(0);
        expect(spy.mock.calls.some((c) => c[0] === "alias")).toBe(true);
    });

    test("moveIn: the deprecated removeOldComponentWithMoveOut still maps to the new field", async () => {
        const animate = vi.spyOn(canvas, "animate").mockReturnValue("canvas-ticker");
        await transitions.moveIn("alias", sprite(), { removeOldComponentWithMoveOut: true });
        expect(animate.mock.calls.some((c) => c[0] === "alias_temp_movein")).toBe(true);
    });

    test("moveIn: animateOldComponentOut is off by default", async () => {
        const animate = vi.spyOn(canvas, "animate").mockReturnValue("canvas-ticker");
        await transitions.moveIn("alias", sprite());
        expect(animate.mock.calls.some((c) => c[0] === "alias_temp_movein")).toBe(false);
    });
});

describe("mask transitions survive a save restore / step back", () => {
    test("a MotionFilterTicker rebuilt from its saved args (valueRef only) can be constructed and drives the mask", async () => {
        const { default: MotionFilterTicker } = await import("../src/motion/components/MotionFilterTicker");
        const config = {
            kind: "iris",
            originX: 0.5,
            originY: 0.5,
            aspect: 1,
            invert: false,
            bounds: { x: 0, y: 0, width: 10, height: 10 },
        };
        const args = {
            keyframes: { value: [0, 1] },
            options: { duration: 1 },
            valueRef: { alias: "alias", config: JSON.parse(JSON.stringify(config)) },
        };
        // No live filter/apply/cleanup: exactly what `RegisteredTickers.getInstance` has after a restore.
        const target = new PIXI.Sprite(PIXI.Texture.WHITE) as any;
        vi.spyOn(canvas, "find").mockReturnValue(target);
        expect(() => new MotionFilterTicker(args as any)).not.toThrow();
        // The mask is already in place when the ticker is rebuilt, before the first frame is rendered.
        expect(target.mask).toBeTruthy();
    });

    test("rebuilding a mask ticker with no canvas (headless) does not throw", async () => {
        const { default: MotionFilterTicker } = await import("../src/motion/components/MotionFilterTicker");
        const config = { kind: "wipe", angle: 0, invert: false, bounds: { x: 0, y: 0, width: 10, height: 10 } };
        vi.spyOn(canvas, "find").mockImplementation(() => {
            throw new Error("no canvas");
        });
        expect(
            () =>
                new MotionFilterTicker({
                    keyframes: { value: [0, 1] },
                    options: { duration: 1 },
                    valueRef: { alias: "alias", config },
                } as any),
        ).not.toThrow();
    });
});

describe("twist filters don't share their center", () => {
    test("two twisted elements of different sizes each get their own offset", async () => {
        const small = new PIXI.Sprite(PIXI.Texture.WHITE) as any;
        small.width = 100;
        small.height = 100;
        const big = new PIXI.Sprite(PIXI.Texture.WHITE) as any;
        big.width = 600;
        big.height = 400;
        big.x = 500;
        const elements = new Map<string, any>([
            ["small", small],
            ["big", big],
        ]);
        vi.spyOn(canvas, "find").mockImplementation((alias: string) => elements.get(alias));
        vi.spyOn(filters, "animate").mockReturnValue("ticker");

        await transitions.twistOut("small");
        await transitions.twistOut("big");

        const smallFilter = small.filters[0];
        const bigFilter = big.filters[0];
        expect(smallFilter).not.toBe(bigFilter);
        // Each center is in its own element's filter area, so the small one can't equal the big one's.
        expect(smallFilter.offsetX).not.toBe(bigFilter.offsetX);
        expect(smallFilter.offsetY).not.toBe(bigFilter.offsetY);
    });
});
