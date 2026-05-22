import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@drincs/pixi-vn/canvas", () => ({
    canvas: {
        app: {
            screen: { height: 600, width: 800 },
        },
    },
}));

vi.mock("@drincs/pixi-vn/characters", () => ({
    RegisteredCharacters: {
        values: vi.fn(() => [{ id: "char1", name: "Character 1" }]),
    },
}));

vi.mock("@drincs/pixi-vn/narration", () => ({
    RegisteredLabels: {
        keys: vi.fn(() => ["label1", "label2"]),
    },
}));

vi.mock("@drincs/pixi-vn/pixi.js", () => ({
    default: {
        Assets: {
            resolver: {
                _assetMap: {
                    asset1: { alias: ["asset1"], src: "asset1.png" },
                },
                _bundles: {
                    bundle1: ["asset1"],
                },
            },
        },
    },
}));

import {
    isViteDevelopmentMode,
    setupPixivnViteData,
} from "../src/vite-listener/plugins";
import {
    PIXIVN_DEV_API_ASSETS_MANIFEST,
    PIXIVN_DEV_API_CANVAS_OPTIONS,
    PIXIVN_DEV_API_CHARACTERS,
    PIXIVN_DEV_API_LABELS,
} from "../src/vite/costants";

function addViteClientScript() {
    const script = document.createElement("script");
    script.src = "/@vite/client";
    document.head.appendChild(script);
    return script;
}

function removeViteScripts() {
    document.querySelectorAll('script[src^="/@vite/"]').forEach((el) => el.remove());
}

describe("isViteDevelopmentMode", () => {
    afterEach(removeViteScripts);

    test("returns false when no vite client script exists", () => {
        expect(isViteDevelopmentMode()).toBe(false);
    });

    test("returns true when script with src=/@vite/client exists", () => {
        addViteClientScript();
        expect(isViteDevelopmentMode()).toBe(true);
    });

    test("returns true when script src starts with /@vite/client (with query params)", () => {
        const script = document.createElement("script");
        script.src = "/@vite/client?v=abc123";
        document.head.appendChild(script);
        expect(isViteDevelopmentMode()).toBe(true);
    });

    test("returns false when only unrelated scripts exist", () => {
        const script = document.createElement("script");
        script.src = "/main.js";
        document.head.appendChild(script);
        expect(isViteDevelopmentMode()).toBe(false);
    });
});

describe("setupPixivnViteData", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn(() => Promise.resolve(new Response()));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        removeViteScripts();
    });

    test("returns a Promise (is async)", () => {
        const result = setupPixivnViteData();
        expect(result).toBeInstanceOf(Promise);
        return result;
    });

    test("resolves to undefined", async () => {
        await expect(setupPixivnViteData()).resolves.toBeUndefined();
    });

    test("does not call fetch when not in vite development mode", async () => {
        await setupPixivnViteData();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test("calls fetch for all four endpoints in vite development mode", async () => {
        addViteClientScript();
        await setupPixivnViteData();

        const calledUrls = fetchMock.mock.calls.map((call) => call[0]);
        expect(calledUrls).toContain(PIXIVN_DEV_API_CHARACTERS);
        expect(calledUrls).toContain(PIXIVN_DEV_API_LABELS);
        expect(calledUrls).toContain(PIXIVN_DEV_API_ASSETS_MANIFEST);
        expect(calledUrls).toContain(PIXIVN_DEV_API_CANVAS_OPTIONS);
    });

    test("sends each request as POST with application/json content-type", async () => {
        addViteClientScript();
        await setupPixivnViteData();

        for (const [, options] of fetchMock.mock.calls) {
            expect(options.method).toBe("POST");
            expect(options.headers["Content-Type"]).toBe("application/json");
        }
    });

    test("sends characters data as valid JSON body", async () => {
        addViteClientScript();
        await setupPixivnViteData();

        const call = fetchMock.mock.calls.find((c) => c[0] === PIXIVN_DEV_API_CHARACTERS);
        expect(call).toBeDefined();
        expect(() => JSON.parse(call![1].body)).not.toThrow();
    });

    test("sends labels data as valid JSON body", async () => {
        addViteClientScript();
        await setupPixivnViteData();

        const call = fetchMock.mock.calls.find((c) => c[0] === PIXIVN_DEV_API_LABELS);
        expect(call).toBeDefined();
        expect(() => JSON.parse(call![1].body)).not.toThrow();
    });

    test("handles fetch rejection gracefully without throwing", async () => {
        fetchMock.mockRejectedValue(new Error("Network error"));
        addViteClientScript();
        await expect(setupPixivnViteData()).resolves.toBeUndefined();
    });
});
