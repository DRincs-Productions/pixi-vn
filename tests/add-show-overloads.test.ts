import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { addImage, addVideo, canvas, ImageSprite, VideoSprite } from "../src/canvas";
import { splitUrlAndOptions } from "../src/canvas/functions/add-arguments-utility";

afterEach(() => vi.restoreAllMocks());

function mockCanvas() {
    vi.spyOn(canvas, "find").mockReturnValue(undefined);
    vi.spyOn(canvas, "copyCanvasElementProperty").mockResolvedValue(undefined as any);
    return vi.spyOn(canvas, "add").mockImplementation(() => {});
}

const textureAlias = (c: ImageSprite) => (c as any).textureAlias as string;

describe("splitUrlAndOptions", () => {
    test("(url, options)", () => {
        expect(splitUrlAndOptions("a.png", { x: 1 })).toEqual({ url: "a.png", options: { x: 1 } });
    });
    test("(undefined, options) uses the alias", () => {
        expect(splitUrlAndOptions(undefined, { x: 1 })).toEqual({ url: undefined, options: { x: 1 } });
    });
    test("(options)", () => {
        expect(splitUrlAndOptions({ x: 1 }, undefined)).toEqual({ url: undefined, options: { x: 1 } });
    });
});

describe.each([
    ["addImage", addImage, ImageSprite],
    ["addVideo", addVideo, VideoSprite],
] as const)("%s overloads", (_name, add, Type) => {
    test("(alias, options) uses the alias as asset and applies the options", () => {
        const canvasAdd = mockCanvas();
        vi.spyOn(PIXI.Assets.resolver, "hasKey").mockReturnValue(true);
        const component = add("bg", { alpha: 0.5, zIndex: 3 });
        expect(component).toBeInstanceOf(Type);
        expect(textureAlias(component)).toBe("bg");
        expect(component.alpha).toBe(0.5);
        expect(canvasAdd).toHaveBeenCalledWith("bg", component, { ignoreOldStyle: true, zIndex: 3 });
    });

    test("(alias, url, options) still works", () => {
        mockCanvas();
        const component = add("bg", "https://example.com/bg.png", { alpha: 0.25 });
        expect(textureAlias(component)).toBe("https://example.com/bg.png");
        expect(component.alpha).toBe(0.25);
    });

    test("(alias, undefined, options) uses the alias", () => {
        mockCanvas();
        vi.spyOn(PIXI.Assets.resolver, "hasKey").mockReturnValue(true);
        const component = add("bg", undefined, { alpha: 0.75 });
        expect(textureAlias(component)).toBe("bg");
        expect(component.alpha).toBe(0.75);
    });

    test("(alias, options) throws when the alias is not registered", () => {
        mockCanvas();
        vi.spyOn(PIXI.Assets.resolver, "hasKey").mockReturnValue(false);
        expect(() => add("missing", { alpha: 0.5 })).toThrow(/does not exist/);
    });
});
