import { EventEmitter } from "events";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// ── assetsManifest ──────────────────────────────────────────────────────────

describe("vitePluginPixivn – assetsManifest", () => {
    let tmpDir: string;
    let typeFilePath: string;

    beforeEach(() => {
        tmpDir = join(tmpdir(), `pixi-vn-test-${Date.now()}-${Math.random()}`);
        mkdirSync(tmpDir, { recursive: true });
        typeFilePath = join(tmpDir, "pixi-vn.keys.gen.ts");
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    function configure(plugin: any) {
        plugin.configResolved({
            root: tmpDir,
            command: "serve",
            logger: { info() {}, error() {}, warn() {} },
        });
        return plugin;
    }

    test("writes bundleIds / assetAliasIds (array-of-assets bundle form) without needing any content option", () => {
        // No `content`/`characters`/`labels` at all: the keys file must still be written from
        // `configResolved` alone, since `allPatterns` is empty and nothing else would trigger it.
        const manifest = {
            bundles: [
                {
                    name: "main",
                    assets: [
                        { alias: "logo", src: "logo.png" },
                        { alias: ["hero", "hero-alt"], src: "hero.png" },
                    ],
                },
            ],
        };
        const plugin: any = configure(vitePluginPixivn({ typeFilePath, assetsManifest: manifest as any }));

        const content = readFileSync(typeFilePath, "utf-8");
        // Same `declare module` augmentation pattern as PixivnCharacterIds/PixivnLabelIds,
        // narrowing BundleIdType/AssetAliasIdType (exported from "@drincs/pixi-vn/canvas") from
        // `string` to a union of known literals.
        expect(content).toContain(`declare module "@drincs/pixi-vn/canvas" {`);
        expect(content).toContain(`interface PixivnBundleIds {`);
        expect(content).toContain(`"main": never;`);
        expect(content).toContain(`interface PixivnAssetAliasIds {`);
        expect(content).toContain(`"logo": never;`);
        expect(content).toContain(`"hero-alt": never;`);
        expect(content).not.toContain(`export type BundleIdType`);
        expect(content).not.toContain(`export type AssetAliasIdType`);
        expect(content).toContain(`export const bundleIds = ["main"] as const;`);
        expect(content).toContain(`export const bundleIdsEnum = {"main":"main"} as const;`);
        expect(content).toContain(
            `export const assetAliasIds = ["logo","hero","hero-alt"] as const;`,
        );
        expect(content).toContain(`"logo":"logo"`);
        expect(content).toContain(`"hero-alt":"hero-alt"`);
        expect(plugin).toBeTruthy();
    });

    test("reads asset aliases from the record-keyed bundle form too", () => {
        // AssetsBundle.assets also supports `Record<alias, source>` — the object keys are the
        // aliases (see PIXI.js's `UnresolvedAsset` union).
        const manifest = {
            bundles: [
                {
                    name: "ui",
                    assets: {
                        background: ["bg.webp", "bg.png"],
                        character: "hero.json",
                    },
                },
            ],
        };
        const plugin: any = configure(vitePluginPixivn({ typeFilePath, assetsManifest: manifest as any }));
        void plugin;

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`export const bundleIds = ["ui"] as const;`);
        expect(content).toContain(`export const assetAliasIds = ["background","character"] as const;`);
    });

    test("still emits empty bundleIds/assetAliasIds arrays and enums when no manifest is configured", () => {
        // Same "always emit, even empty" invariant as characterIdsEnum/labelIdsEnum: a missing
        // export would crash `zod.enum(undefined)` for any consumer built against these ids.
        const plugin: any = configure(vitePluginPixivn({ typeFilePath }));
        void plugin;

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).not.toContain(`declare module "@drincs/pixi-vn/canvas"`);
        expect(content).toContain(`export const bundleIds = [] as const;`);
        expect(content).toContain(`export const bundleIdsEnum = {} as const;`);
        expect(content).toContain(`export const assetAliasIds = [] as const;`);
        expect(content).toContain(`export const assetAliasIdsEnum = {} as const;`);
    });

    test("GET /__pixi-vn/assets/manifest returns the configured manifest immediately, without a POST", async () => {
        const manifest = { bundles: [{ name: "main", assets: [] }] };
        const plugin: any = vitePluginPixivn({ assetsManifest: manifest as any });
        const server = createServer();
        plugin.configureServer(server);
        const handler = server.getHandler(PIXIVN_DEV_API_ASSETS_MANIFEST);

        const req = createGetReq();
        const res = createRes();
        handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual(manifest);
    });

    test("a later POST still overrides the manifest seeded from the assetsManifest option", async () => {
        const initialManifest = { bundles: [{ name: "main", assets: [] }] };
        const postedManifest = { bundles: [{ name: "override", assets: [] }] };
        const plugin: any = vitePluginPixivn({ assetsManifest: initialManifest as any });
        const server = createServer();
        plugin.configureServer(server);
        const handler = server.getHandler(PIXIVN_DEV_API_ASSETS_MANIFEST);

        handler(createPostReq(JSON.stringify(postedManifest)), createRes());
        await new Promise((res) => setTimeout(res, 0));

        const getRes = createRes();
        handler(createGetReq(), getRes);
        expect(JSON.parse(getRes.body)).toEqual(postedManifest);
    });

    test("GET /__pixi-vn/assets/manifest returns 404 when neither the option nor a POST provided one", () => {
        const plugin: any = vitePluginPixivn();
        const server = createServer();
        plugin.configureServer(server);
        const handler = server.getHandler(PIXIVN_DEV_API_ASSETS_MANIFEST);

        const res = createRes();
        handler(createGetReq(), res);

        expect(res.statusCode).toBe(404);
    });

    test("api.setAssetsManifest registers a manifest known only after plugin-creation time", () => {
        // Regression coverage for the intended use case: an async asset pipeline (e.g.
        // @assetpack/core) that finishes after the plugins array was already built, and hands
        // the plugin its manifest via the API instead of the (synchronous-only) option.
        const plugin: any = configure(vitePluginPixivn({ typeFilePath }));

        // Nothing registered yet: same as the "no manifest configured" case.
        let content = readFileSync(typeFilePath, "utf-8");
        expect(content).not.toContain(`declare module "@drincs/pixi-vn/canvas"`);

        plugin.api.setAssetsManifest({
            bundles: [{ name: "main", assets: [{ alias: "logo", src: "logo.png" }] }],
        });

        content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`declare module "@drincs/pixi-vn/canvas"`);
        expect(content).toContain(`export const bundleIds = ["main"] as const;`);
        expect(content).toContain(`export const assetAliasIds = ["logo"] as const;`);
    });

    test("api.setAssetsManifest also updates GET /__pixi-vn/assets/manifest immediately", () => {
        const plugin: any = vitePluginPixivn();
        const server = createServer();
        plugin.configureServer(server);
        const handler = server.getHandler(PIXIVN_DEV_API_ASSETS_MANIFEST);

        // Before any manifest is registered: 404, same as the plain "no option, no POST" case.
        const beforeRes = createRes();
        handler(createGetReq(), beforeRes);
        expect(beforeRes.statusCode).toBe(404);

        const manifest = { bundles: [{ name: "ui", assets: [] }] };
        plugin.api.setAssetsManifest(manifest);

        const afterRes = createRes();
        handler(createGetReq(), afterRes);
        expect(afterRes.statusCode).toBe(200);
        expect(JSON.parse(afterRes.body)).toEqual(manifest);
    });

    test("api.setAssetsManifest called again (e.g. on every watch cycle) keeps the keys file in sync", () => {
        const plugin: any = configure(vitePluginPixivn({ typeFilePath }));

        plugin.api.setAssetsManifest({ bundles: [{ name: "first", assets: [] }] });
        expect(readFileSync(typeFilePath, "utf-8")).toContain(
            `export const bundleIds = ["first"] as const;`,
        );

        plugin.api.setAssetsManifest({ bundles: [{ name: "second", assets: [] }] });
        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`export const bundleIds = ["second"] as const;`);
        expect(content).not.toContain(`"first"`);
    });

    /** A fake dev server exposing only what `loadModules`/`hotUpdate` touch for these tests. */
    function createSsrServer(ssrLoadModule: (id: string) => Promise<unknown>) {
        return {
            ssrLoadModule,
            middlewares: { use() {} },
            moduleGraph: { getModulesByFile: () => [] },
        };
    }

    test("assetsManifest as a function is called with an ssrLoadModule and its result is used", async () => {
        // Regression coverage for the primary intended use case: a manifest merged from a
        // generated file plus hand-written bundles, loaded through Vite's SSR module runner
        // (not a plain dynamic `import()`) because it needs to resolve `@/`-aliased app modules.
        const ssrLoadModule = vi.fn(async (id: string) => {
            expect(id).toBe("/src/assets/index.ts");
            return { manifest: { bundles: [{ name: "merged", assets: [{ alias: "hero" }] }] } };
        });
        const plugin: any = configure(
            vitePluginPixivn({
                typeFilePath,
                assetsManifest: async (load) => {
                    const mod = (await load("/src/assets/index.ts")) as any;
                    return mod.manifest;
                },
            }),
        );

        plugin.configureServer(createSsrServer(ssrLoadModule));
        await plugin.api.contentLoaded;

        expect(ssrLoadModule).toHaveBeenCalledWith("/src/assets/index.ts");
        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`export const bundleIds = ["merged"] as const;`);
        expect(content).toContain(`export const assetAliasIds = ["hero"] as const;`);
    });

    test("assetsManifest as a function returning undefined leaves bundleIds/assetAliasIds empty (no crash)", async () => {
        const plugin: any = configure(
            vitePluginPixivn({
                typeFilePath,
                assetsManifest: async () => undefined,
            }),
        );

        plugin.configureServer(createSsrServer(async () => ({})));
        await plugin.api.contentLoaded;

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain(`export const bundleIds = [] as const;`);
        expect(content).toContain(`export const assetAliasIds = [] as const;`);
    });

    test("content loads after characters/labels, so a content file's keys-file import sees fresh ids", async () => {
        // Regression test: `content` files commonly build a validator from the generated keys
        // file, e.g. `zod.enum(characterIdsEnum)` for a custom hashtag command. If `content`
        // loaded in the same pass as `characters`/`labels` — before the keys file was
        // (re)written for *this* run — that import would see whatever characterIdsEnum
        // happened to be on disk from the *previous* run: empty on a first-ever run, and
        // capable of going stale any time content and characters/labels are loaded together.
        writeFileSync(join(tmpDir, "characters.ts"), "// characters");
        writeFileSync(join(tmpDir, "content.ts"), "// content");

        const registered: { id: string }[] = [];
        const seenCharacterIdsEnumAtContentLoad: string[] = [];

        const plugin: any = configure(
            vitePluginPixivn({
                typeFilePath,
                characters: "./characters.ts",
                content: "./content.ts",
            }),
        );

        const ssrLoadModule = async (id: string) => {
            if (id === "@drincs/pixi-vn/characters") {
                return { RegisteredCharacters: { values: () => registered } };
            }
            if (id === "@drincs/pixi-vn/narration") {
                return { RegisteredLabels: { keys: () => [] } };
            }
            if (id.includes("characters.ts")) {
                registered.push({ id: "mc" });
                return {};
            }
            if (id.includes("content.ts")) {
                // Simulate a content file importing the generated keys file, the same way
                // `zod.enum(characterIdsEnum)` does in real app code.
                const generated = readFileSync(typeFilePath, "utf-8");
                const match = generated.match(/characterIdsEnum = (\{[^}]*\})/);
                seenCharacterIdsEnumAtContentLoad.push(match ? match[1] : "<missing>");
                return {};
            }
            return {};
        };

        plugin.configureServer(createSsrServer(ssrLoadModule));
        await plugin.api.contentLoaded;

        expect(seenCharacterIdsEnumAtContentLoad).toEqual([`{"mc":"mc"}`]);
    });

    test("hotUpdate re-invokes the assetsManifest function even for a file it doesn't otherwise track", async () => {
        // The function's own import (e.g. of a generated manifest.gen.json merged with other
        // bundles) can depend on files this plugin has no `content`/`characters`/`labels`
        // pattern for — it must still refresh on changes to *any* file, not just its own.
        let call = 0;
        const plugin: any = configure(
            vitePluginPixivn({
                typeFilePath,
                assetsManifest: async () => {
                    call += 1;
                    return { bundles: [{ name: `run-${call}`, assets: [] }] };
                },
            }),
        );

        const server = createSsrServer(async () => ({}));
        plugin.configureServer(server);
        await plugin.api.contentLoaded;
        expect(readFileSync(typeFilePath, "utf-8")).toContain(
            `export const bundleIds = ["run-1"] as const;`,
        );

        const result = plugin.hotUpdate({
            file: join(tmpDir, "some-unrelated-file.ts"),
            server,
            modules: [],
            timestamp: Date.now(),
            read: () => Promise.resolve(""),
            environment: {},
        });
        // Doesn't suppress Vite's own default HMR handling for the unrelated file.
        expect(result).toBeUndefined();
        await new Promise((r) => setTimeout(r, 0));

        expect(readFileSync(typeFilePath, "utf-8")).toContain(
            `export const bundleIds = ["run-2"] as const;`,
        );
    });

    test("hotUpdate does not re-invoke a plain-value assetsManifest for unrelated files", async () => {
        const plugin: any = configure(
            vitePluginPixivn({ typeFilePath, assetsManifest: { bundles: [{ name: "static", assets: [] }] } as any }),
        );
        const before = readFileSync(typeFilePath, "utf-8");

        const server = createSsrServer(async () => {
            throw new Error("should not be called for a plain-value assetsManifest");
        });
        plugin.hotUpdate({
            file: join(tmpDir, "some-unrelated-file.ts"),
            server,
            modules: [],
            timestamp: Date.now(),
            read: () => Promise.resolve(""),
            environment: {},
        });
        await new Promise((r) => setTimeout(r, 0));

        expect(readFileSync(typeFilePath, "utf-8")).toBe(before);
    });
});

// ── dev-server state sync (GET endpoints reflect SSR-loaded content) ────────

describe("vitePluginPixivn – dev-server state sync (regression)", () => {
    // Regression coverage: `state.characters`/`state.labels` (backing `GET
    // /__pixi-vn/characters` and `GET /__pixi-vn/labels`) used to be written to only by the
    // deprecated `POST` handler. SSR-loaded content populated `ssrCharacters`/`ssrLabels` (and
    // the generated `typeFilePath`) just fine, but the dev-server state itself was never synced
    // from them — so `GET /__pixi-vn/labels` kept 404-ing with "Labels not initialized" even
    // though labels were demonstrably registered (visible in the generated `labelIds`).
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = join(tmpdir(), `pixi-vn-state-sync-test-${Date.now()}-${Math.random()}`);
        mkdirSync(tmpDir, { recursive: true });
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    function createFullServer(ssrLoadModule: (id: string) => Promise<unknown>) {
        const handlers = new Map<string, MiddlewareHandler>();
        return {
            ssrLoadModule,
            middlewares: {
                use(path: string, handler: MiddlewareHandler) {
                    handlers.set(path, handler);
                },
            },
            moduleGraph: { getModulesByFile: () => [] },
            getHandler(path: string): MiddlewareHandler {
                const handler = handlers.get(path);
                if (!handler) throw new Error(`No handler registered for ${path}`);
                return handler;
            },
        };
    }

    function configure(plugin: any) {
        plugin.configResolved({
            root: tmpDir,
            command: "serve",
            logger: { info() {}, error() {}, warn() {} },
        });
        return plugin;
    }

    test("GET /__pixi-vn/characters reflects SSR-registered characters without any POST", async () => {
        const registeredCharacters = [{ id: "mc" }, { id: "james" }];
        const plugin: any = configure(vitePluginPixivn({ characters: "./characters.ts" }));
        const server = createFullServer(async (id: string) => {
            if (id === "@drincs/pixi-vn/characters") {
                return { RegisteredCharacters: { values: () => registeredCharacters } };
            }
            if (id === "@drincs/pixi-vn/narration") {
                return { RegisteredLabels: { keys: () => [] } };
            }
            return {};
        });
        plugin.configureServer(server);
        await plugin.api.contentLoaded;

        const res = createRes();
        server.getHandler(PIXIVN_DEV_API_CHARACTERS)(createGetReq(), res);

        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual(registeredCharacters);
    });

    test("GET /__pixi-vn/labels reflects SSR-registered labels without any POST", async () => {
        const plugin: any = configure(vitePluginPixivn({ labels: "./labels.ts" }));
        const server = createFullServer(async (id: string) => {
            if (id === "@drincs/pixi-vn/characters") {
                return { RegisteredCharacters: { values: () => [] } };
            }
            if (id === "@drincs/pixi-vn/narration") {
                return { RegisteredLabels: { keys: () => ["start", "second_part"] } };
            }
            return {};
        });
        plugin.configureServer(server);
        await plugin.api.contentLoaded;

        const res = createRes();
        server.getHandler(PIXIVN_DEV_API_LABELS)(createGetReq(), res);

        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual(["start", "second_part"]);
    });

    test("api.setExternalLabels also updates GET /__pixi-vn/labels immediately", () => {
        const plugin: any = vitePluginPixivn();
        const server = createFullServer(async () => ({}));
        plugin.configureServer(server);
        const handler = server.getHandler(PIXIVN_DEV_API_LABELS);

        const before = createRes();
        handler(createGetReq(), before);
        expect(before.statusCode).toBe(404);

        plugin.api.setExternalLabels("provider", ["extLabel"]);

        const after = createRes();
        handler(createGetReq(), after);
        expect(after.statusCode).toBe(200);
        expect(JSON.parse(after.body)).toEqual(["extLabel"]);
    });

    test("api.clearExternalLabels also updates GET /__pixi-vn/labels immediately", () => {
        const plugin: any = vitePluginPixivn();
        const server = createFullServer(async () => ({}));
        plugin.configureServer(server);
        plugin.api.setExternalLabels("provider", ["extLabel"]);
        const handler = server.getHandler(PIXIVN_DEV_API_LABELS);

        plugin.api.clearExternalLabels("provider");

        const res = createRes();
        handler(createGetReq(), res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual([]);
    });

    test("reloadContent (hot-reload) keeps GET /__pixi-vn/characters and /labels in sync", async () => {
        writeFileSync(join(tmpDir, "characters.ts"), "// characters");
        const registered = { characters: [{ id: "mc" }], labels: ["start"] };
        const plugin: any = configure(vitePluginPixivn({ characters: "./characters.ts" }));
        const ssrLoadModule = async (id: string) => {
            if (id === "@drincs/pixi-vn/characters") {
                return {
                    RegisteredCharacters: { values: () => registered.characters, clear() {} },
                };
            }
            if (id === "@drincs/pixi-vn/narration") {
                return { RegisteredLabels: { keys: () => registered.labels, clear() {} } };
            }
            return {};
        };
        const server = createFullServer(ssrLoadModule);
        plugin.configureServer(server);
        await plugin.api.contentLoaded;

        // Simulate a content edit that changes the registered characters/labels, then a
        // hot-reload cycle picking that change up.
        registered.characters = [{ id: "mc" }, { id: "james" }];
        registered.labels = ["start", "second_part"];
        await plugin.hotUpdate({
            file: join(tmpDir, "characters.ts"),
            server,
            modules: [],
            timestamp: Date.now(),
            read: () => Promise.resolve(""),
            environment: {},
        });
        await new Promise((r) => setTimeout(r, 0));

        const charactersRes = createRes();
        server.getHandler(PIXIVN_DEV_API_CHARACTERS)(createGetReq(), charactersRes);
        expect(JSON.parse(charactersRes.body)).toEqual(registered.characters);

        const labelsRes = createRes();
        server.getHandler(PIXIVN_DEV_API_LABELS)(createGetReq(), labelsRes);
        expect(JSON.parse(labelsRes.body)).toEqual(registered.labels);
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
