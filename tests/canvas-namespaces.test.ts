import { afterEach, describe, expect, test, vi } from "vitest";
import * as canvasExports from "../src/canvas";
import { effects, transitions, UPDATE_PRIORITY } from "../src/canvas";

afterEach(() => vi.restoreAllMocks());

describe("canvas transition and effect namespaces", () => {
    test("exposes every transition through transitions", () => {
        expect(Object.keys(transitions).sort()).toEqual([
            "moveIn",
            "moveOut",
            "pushIn",
            "pushOut",
            "removeWithDissolve",
            "removeWithFade",
            "showWithDissolve",
            "showWithFade",
            "zoomIn",
            "zoomOut",
        ]);
        expect(Object.values(transitions).every((transition) => typeof transition === "function")).toBe(true);
    });

    test("exposes canvas effects through effects", () => {
        expect(Object.keys(effects)).toEqual(["shakeEffect"]);
        expect(typeof effects.shakeEffect).toBe("function");
    });
});

describe("legacy canvas exports", () => {
    const incoming = ["showWithDissolve", "showWithFade", "moveIn", "zoomIn", "pushIn"] as const;
    const outgoing = ["removeWithDissolve", "removeWithFade", "moveOut", "zoomOut", "pushOut"] as const;

    test.each(incoming)("%s forwards arguments and preserves the async result", async (name) => {
        const ids = ["animation-1", "animation-2"];
        const options = { duration: 0.25, completeOnContinue: false };
        const spy = vi.spyOn(transitions, name).mockResolvedValue(ids);

        const result = canvasExports[name]("alice", "alice-happy", options, UPDATE_PRIORITY.HIGH);

        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBe(ids);
        expect(spy).toHaveBeenCalledExactlyOnceWith("alice", "alice-happy", options, UPDATE_PRIORITY.HIGH);

        spy.mockResolvedValueOnce(undefined);
        await expect(canvasExports[name]("alice")).resolves.toBeUndefined();
        expect(spy).toHaveBeenLastCalledWith("alice", undefined, {}, undefined);
    });

    test.each(outgoing)("%s forwards arguments and preserves the synchronous result", (name) => {
        const ids = ["animation-1", "animation-2"];
        const options = { duration: 0.25, completeOnContinue: false };
        const spy = vi.spyOn(transitions, name).mockReturnValue(ids);

        expect(canvasExports[name]("alice", options, UPDATE_PRIORITY.HIGH)).toBe(ids);
        expect(spy).toHaveBeenCalledExactlyOnceWith("alice", options, UPDATE_PRIORITY.HIGH);

        spy.mockReturnValueOnce(undefined);
        expect(canvasExports[name]("alice")).toBeUndefined();
        expect(spy).toHaveBeenLastCalledWith(
            "alice", name === "pushOut" ? { direction: "right" } : {}, undefined,
        );
    });

    test("shakeEffect forwards arguments and preserves the async result", async () => {
        const ids = ["shake-1"];
        const options = { shakeType: "vertical" as const, maxShockSize: 12, duration: 0.25 };
        const spy = vi.spyOn(effects, "shakeEffect").mockResolvedValue(ids);

        const result = canvasExports.shakeEffect("alice", options, UPDATE_PRIORITY.LOW);

        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBe(ids);
        expect(spy).toHaveBeenCalledExactlyOnceWith("alice", options, UPDATE_PRIORITY.LOW);

        spy.mockResolvedValueOnce(undefined);
        await expect(canvasExports.shakeEffect("alice")).resolves.toBeUndefined();
        expect(spy).toHaveBeenLastCalledWith("alice", {}, undefined);
    });
});
