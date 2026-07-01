import { EventEmitter } from "events";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    PIXIVN_DEV_API_ASSETS_MANIFEST,
    PIXIVN_DEV_API_CANVAS_OPTIONS,
    PIXIVN_DEV_API_CHARACTERS,
    PIXIVN_DEV_API_LABELS,
} from "../src/vite/costants";
import { vitePluginPixivn } from "../src/vite/plugins";

let capturedTempServerConfig: any;

vi.mock("vite", async (importOriginal) => {
    const actual = await importOriginal<typeof import("vite")>();
    return {
        ...actual,
        createServer: vi.fn(async (config: any) => {
            capturedTempServerConfig = config;
            return {
                ssrLoadModule: async () => ({}),
                close: async () => {},
            };
        }),
    };
});

type MiddlewareHandler = (req: any, res: any) => void;

function createServer() {
    const handlers = new Map<string, MiddlewareHandler>();
    return {
        middlewares: {
            use(path: string, handler: MiddlewareHandler) {
                handlers.set(path, handler);
            },
        },
        getHandler(path: string): MiddlewareHandler {
            const handler = handlers.get(path);
            if (!handler) throw new Error(`No handler registered for ${path}`);
            return handler;
        },
    };
}

function createGetReq() {
    const req = new EventEmitter() as any;
    req.method = "GET";
    return req;
}

function createPostReq(body: string) {
    const req = new EventEmitter() as any;
    req.method = "POST";
    Promise.resolve().then(() => {
        req.emit("data", body);
        req.emit("end");
    });
    return req;
}

function createRes() {
    return {
        statusCode: 0,
        headers: {} as Record<string, string>,
        body: "",
        setHeader(key: string, value: string) {
            this.headers[key] = value;
        },
        end(data: string) {
            this.body = data;
        },
    };
}

describe("vitePluginPixivn", () => {
    test("returns a plugin with correct name and enforce", () => {
        const plugin = vitePluginPixivn();
        expect(plugin.name).toBe("vite-plugin-pixi-vn");
        expect(plugin.enforce).toBe("pre");
    });

    test("registers middleware for all expected endpoints", () => {
        const plugin = vitePluginPixivn();
        const server = createServer();
        plugin.configureServer(server);

        expect(() => server.getHandler(PIXIVN_DEV_API_CHARACTERS)).not.toThrow();
        expect(() => server.getHandler(PIXIVN_DEV_API_LABELS)).not.toThrow();
        expect(() => server.getHandler(PIXIVN_DEV_API_ASSETS_MANIFEST)).not.toThrow();
        expect(() => server.getHandler(PIXIVN_DEV_API_CANVAS_OPTIONS)).not.toThrow();
    });
});

describe.each([
    { label: "characters", endpoint: PIXIVN_DEV_API_CHARACTERS, data: [{ id: "char1" }] },
    { label: "labels", endpoint: PIXIVN_DEV_API_LABELS, data: ["label1", "label2"] },
    { label: "manifest", endpoint: PIXIVN_DEV_API_ASSETS_MANIFEST, data: { bundles: [] } },
    {
        label: "canvas options",
        endpoint: PIXIVN_DEV_API_CANVAS_OPTIONS,
        data: { width: 800, height: 600 },
    },
])("$label endpoint ($endpoint)", ({ endpoint, data }) => {
    let handler: MiddlewareHandler;

    beforeEach(() => {
        const plugin = vitePluginPixivn();
        const server = createServer();
        plugin.configureServer(server);
        handler = server.getHandler(endpoint);
    });

    test("sets Content-Type to application/json on GET", () => {
        const req = createGetReq();
        const res = createRes();
        handler(req, res);
        expect(res.headers["Content-Type"]).toBe("application/json");
    });

    test("GET returns 404 with error body when not initialized", () => {
        const req = createGetReq();
        const res = createRes();
        handler(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res.body)).toHaveProperty("error");
    });

    test("POST with valid JSON returns 201 with message", async () => {
        const req = createPostReq(JSON.stringify(data));
        const res = createRes();
        handler(req, res);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.body)).toHaveProperty("message");
    });

    test("GET after POST returns stored data with status 200", async () => {
        const postReq = createPostReq(JSON.stringify(data));
        const postRes = createRes();
        handler(postReq, postRes);
        await new Promise((resolve) => setTimeout(resolve, 0));

        const getReq = createGetReq();
        const getRes = createRes();
        handler(getReq, getRes);
        expect(getRes.statusCode).toBe(200);
        expect(JSON.parse(getRes.body)).toEqual(data);
    });

    test("POST with invalid JSON returns 400 with error body", async () => {
        const req = createPostReq("not-valid-json{{{");
        const res = createRes();
        handler(req, res);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body)).toHaveProperty("error");
    });
});

// ── type file generation ──────────────────────────────────────────────────────

describe("vitePluginPixivn – type file generation", () => {
    let tmpDir: string;
    let typeFilePath: string;

    beforeEach(() => {
        tmpDir = join(tmpdir(), `pixi-vn-test-${Date.now()}`);
        mkdirSync(tmpDir, { recursive: true });
        typeFilePath = join(tmpDir, "pixi-vn.keys.gen.ts");
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    function createConfiguredPlugin(filePath = typeFilePath) {
        const plugin = vitePluginPixivn({ typeFilePath: filePath });
        // Simulate configResolved so resolvedConfig is available
        (plugin.configResolved as any)({ root: tmpDir, command: "serve", logger: { info() {}, error() {} } });
        return plugin;
    }

    test("setExternalLabels writes a type file with declare module augmentations", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("myPlugin", ["startLabel", "menuLabel"]);

        expect(existsSync(typeFilePath)).toBe(true);
        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`declare module "@drincs/pixi-vn/narration"`);
        expect(content).toContain(`interface PixivnLabelIds`);
        expect(content).toContain(`"startLabel": never`);
        expect(content).toContain(`"menuLabel": never`);
    });

    test("setExternalLabels writes runtime labelIds array and enum", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("myPlugin", ["startLabel", "menuLabel"]);

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`export const labelIds`);
        expect(content).toContain(`"startLabel"`);
        expect(content).toContain(`"menuLabel"`);
        expect(content).toContain(`as const`);
        expect(content).toContain(`export const labelIdsEnum`);
        expect(content).toContain(`"startLabel":"startLabel"`);
        expect(content).toContain(`"menuLabel":"menuLabel"`);
    });

    test("setExternalLabels always writes runtime characterIds array", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("myPlugin", ["lbl"]);

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`export const characterIds`);
        expect(content).toContain(`as const`);
    });

    test("setExternalLabels merges labels from multiple providers", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("providerA", ["labelA"]);
        (plugin.api as any).setExternalLabels("providerB", ["labelB"]);

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`"labelA": never`);
        expect(content).toContain(`"labelB": never`);
    });

    test("setExternalLabels replaces existing labels for the same provider", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("provider", ["oldLabel"]);
        (plugin.api as any).setExternalLabels("provider", ["newLabel"]);

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).not.toContain(`"oldLabel"`);
        expect(content).toContain(`"newLabel": never`);
    });

    test("clearExternalLabels removes provider labels from augmentations and arrays", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("provider", ["startLabel"]);
        (plugin.api as any).clearExternalLabels("provider");

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).not.toContain(`"startLabel"`);
        expect(content).toContain(`export const labelIds`);
        expect(content).toContain(`export const characterIds`);
    });

    test("clearExternalLabels for unknown provider is a no-op", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("knownProvider", ["label1"]);
        // Should not throw
        expect(() => (plugin.api as any).clearExternalLabels("unknownProvider")).not.toThrow();
        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`"label1": never`);
    });

    test("generated file has the auto-generated header comment", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("p", ["l"]);
        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain("auto-generated");
    });

    test("generated file with no IDs has empty runtime arrays and empty enums, but no augmentations", () => {
        const plugin = createConfiguredPlugin();
        (plugin.api as any).setExternalLabels("p", []);
        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).not.toContain(`interface PixivnLabelIds`);
        expect(content).not.toContain(`interface PixivnCharacterIds`);
        expect(content).toContain(`export const characterIds = [] as const`);
        expect(content).toContain(`export const labelIds = [] as const`);
        // Regression: the enum exports must always be present, even when empty. Consumers
        // commonly do `zod.enum(characterIdsEnum)` at module top-level; if this export were
        // missing entirely (e.g. right after a fresh checkout, or after an interrupted
        // dev-server run left the file with no ids), the import resolves to `undefined` and
        // `zod.enum(undefined)` throws — aborting evaluation of the importing module and every
        // sibling module still queued behind it (e.g. other content files glob-imported by the
        // same barrel module).
        expect(content).toContain(`export const characterIdsEnum = {} as const;`);
        expect(content).toContain(`export const labelIdsEnum = {} as const;`);
    });

    test("hotUpdate returns [] for the generated type file", () => {
        const plugin = createConfiguredPlugin(typeFilePath);
        const result = (plugin.hotUpdate as any)({
            file: typeFilePath,
            server: {},
            modules: [],
            timestamp: Date.now(),
            read: () => Promise.resolve(""),
            environment: {},
        });
        expect(result).toEqual([]);
    });

    test("hotUpdate does NOT intercept unrelated files", () => {
        const plugin = createConfiguredPlugin(typeFilePath);
        const result = (plugin.hotUpdate as any)({
            file: join(tmpDir, "somethingElse.ts"),
            server: {},
            modules: [],
            timestamp: Date.now(),
            read: () => Promise.resolve(""),
            environment: {},
        });
        // Should be undefined (no interception) for unrelated files
        expect(result).toBeUndefined();
    });
});

describe("vitePluginPixivn buildStart (build mode)", () => {
    afterEach(() => {
        capturedTempServerConfig = undefined;
    });

    test("forwards the project's resolved alias config to the temp SSR server", async () => {
        // Regression test: `buildStart` (build mode) loads content via a bare `createServer()`
        // call with `configFile: false`. Without forwarding `resolve` from the real
        // `resolvedConfig`, that temp server has no idea how to resolve path aliases (e.g. `@/`
        // from `resolve.tsconfigPaths` or a manual `resolve.alias`) — so any content file using
        // them (in practice, almost all of them) silently fails to load, and the generated keys
        // file ends up badly incomplete, breaking `vite build` / `tsc -b`.
        const fakeResolve = { alias: [{ find: "@", replacement: "/fake/src" }] };
        const plugin: any = vitePluginPixivn({ content: "./src/content/index.ts" });
        plugin.configResolved({
            root: tmpdir(),
            command: "build",
            resolve: fakeResolve,
            logger: { info() {}, error() {}, warn() {} },
        });

        await plugin.buildStart();

        expect(capturedTempServerConfig?.resolve).toBe(fakeResolve);
    });
});
