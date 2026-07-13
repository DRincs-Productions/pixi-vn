import type { CharacterInterface } from "@drincs/pixi-vn/characters";
import type { ApplicationOptions, AssetsManifest } from "@drincs/pixi-vn/pixi.js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, isAbsolute, resolve } from "node:path";
import pc from "picocolors";
import { glob } from "tinyglobby";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import {
    PIXIVN_DEV_API_ASSETS_MANIFEST,
    PIXIVN_DEV_API_CANVAS_OPTIONS,
    PIXIVN_DEV_API_CHARACTERS,
    PIXIVN_DEV_API_LABELS,
} from "./costants";

const PLUGIN_PREFIX = pc.cyan("(pixi-vn)");

function asArray(value: string | string[] | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

/**
 * Extracts every bundle name declared in an {@link AssetsManifest}.
 * @param manifest - The manifest to read, or `undefined` when none was configured.
 * @returns The list of bundle names (`manifest.bundles[].name`), in manifest order. Empty when
 *   `manifest` is `undefined`.
 */
function getBundleIds(manifest: AssetsManifest | undefined): string[] {
    if (!manifest) return [];
    return manifest.bundles.map((bundle) => bundle.name);
}

/**
 * Extracts every asset alias declared across all bundles in an {@link AssetsManifest}.
 *
 * `AssetsBundle.assets` supports two shapes (see PIXI.js's `UnresolvedAsset`):
 * - an array of asset descriptors, each with an optional `alias` (`string | string[]`);
 * - a record mapping alias → source, where the object *keys themselves* are the aliases.
 *
 * @param manifest - The manifest to read, or `undefined` when none was configured.
 * @returns The deduplicated list of every asset alias found, in first-seen order. Empty when
 *   `manifest` is `undefined`.
 */
function getAssetAliasIds(manifest: AssetsManifest | undefined): string[] {
    if (!manifest) return [];
    const aliases = new Set<string>();
    for (const bundle of manifest.bundles) {
        const assets = bundle.assets;
        if (Array.isArray(assets)) {
            for (const asset of assets) {
                const alias = asset.alias;
                if (!alias) continue;
                for (const a of Array.isArray(alias) ? alias : [alias]) aliases.add(a);
            }
        } else if (assets && typeof assets === "object") {
            for (const alias of Object.keys(assets)) aliases.add(alias);
        }
    }
    return Array.from(aliases);
}

function staticAnalyzeFiles(files: string[]): { charIds: string[]; labelIds: string[] } {
    const charIds: string[] = [];
    const labelIds: string[] = [];
    for (const file of files) {
        try {
            const content = readFileSync(file, "utf-8");
            const labelRe = /newLabel\(\s*["']([^"']+)["']/g;
            let m: RegExpExecArray | null;
            while ((m = labelRe.exec(content)) !== null) labelIds.push(m[1]);
            const charRe = /new\s+\w*[Cc]haracter\(\s*["']([^"']+)["']/g;
            while ((m = charRe.exec(content)) !== null) charIds.push(m[1]);
        } catch {
            /* ignore */
        }
    }
    return { charIds, labelIds };
}

/**
 * Either a plain {@link AssetsManifest}, or a function that resolves one — see
 * {@link VitePluginPixivnOptions.assetsManifest}.
 */
export type AssetsManifestOption =
    | AssetsManifest
    | ((
          ssrLoadModule: (id: string) => Promise<unknown>,
      ) => AssetsManifest | undefined | Promise<AssetsManifest | undefined>);

/**
 * Options for {@link vitePluginPixivn}.
 */
export interface VitePluginPixivnOptions {
    /**
     * Glob / path of module(s) that set up all game content as side effects:
     * characters, labels, hashtag-command handlers, text-replace handlers, etc.
     *
     * The plugin loads these files server-side (via Vite SSR) at startup so that
     * every downstream plugin that depends on the registered data — most notably
     * `vitePluginInk` for JSON compilation — has the full registry available
     * before it runs.  This also works during `vite build`.
     *
     * Pointing to a barrel file that re-exports everything is the simplest option.
     * All patterns are resolved relative to Vite `root`.
     *
     * @example "./src/content/index.ts"
     * @example "./src/content/*.ts"
     */
    content?: string | string[];

    /**
     * Glob / path of module(s) whose side effects register characters via
     * `RegisteredCharacters.add(...)`.
     *
     * Use when characters are defined separately from other content.
     *
     * @example "./src/characters.ts"
     */
    characters?: string | string[];

    /**
     * Glob / path of module(s) whose side effects register narration labels via
     * `RegisteredLabels.register(...)`.
     *
     * @example "./src/*.label.ts"
     */
    labels?: string | string[];

    /**
     * Path to the auto-generated TypeScript file that combines compile-time type
     * augmentations and runtime `as const` arrays for all currently known entity IDs.
     *
     * When provided, the plugin generates (or overwrites) this file:
     * - after all content modules have been loaded at startup,
     * - after every hot-reload of a watched content file,
     * - whenever `api.setExternalLabels` or `api.clearExternalLabels` is called.
     *
     * The generated file contains:
     * - `declare module` augmentations for `PixivnCharacterIds` and `PixivnLabelIds`,
     *   narrowing `CharacterIdType` / `LabelIdType` to unions of known string literals.
     * - `export const characterIds` and `export const labelIds` as `as const` arrays,
     *   usable at runtime for validation (e.g. `z.enum(characterIds)`).
     *
     * The generated file is **excluded from HMR** so that updating it never
     * triggers a full-page reload.
     *
     * The path may be absolute or relative to Vite `root`.
     *
     * @example "./src/pixi-vn.keys.gen.ts"
     */
    typeFilePath?: string;

    /**
     * A PIXI.js {@link AssetsManifest} describing all asset bundles and their aliases — or a
     * function that resolves one, for manifests that aren't known synchronously at
     * plugin-creation time (e.g. one produced by an asset pipeline such as `@assetpack/core`, or
     * merged together from several sources in an app-owned module).
     *
     * **Prefer the function form for anything backed by a generated file.** A *static*
     * `import manifest from "./manifest.gen.json"` in `vite.config.ts` makes Vite treat that file
     * as a config dependency — restarting the whole server on every change to it — which is
     * disastrous when the very same config's own asset pipeline rewrites that file on every
     * startup: an infinite restart loop. The function form sidesteps this entirely: nothing in
     * `vite.config.ts` itself reads or imports the file; the plugin calls your function lazily,
     * from inside its own plugin hooks, whenever it needs a fresh manifest.
     *
     * The function receives an `ssrLoadModule`-like loader (bound to whichever context is
     * available — the running dev server, or a dedicated temporary server with this plugin's own
     * `resolve` forwarded during `vite build`) so it can load `@/`-aliased app modules the same
     * way `content` / `characters` / `labels` do — e.g. to import a module that merges an asset
     * pipeline's generated manifest with hand-written bundles. Return `undefined` if there's
     * nothing to register yet (e.g. the pipeline hasn't produced output on a fresh checkout).
     *
     * The plugin calls this function whenever it (re)loads content — at startup, and on every
     * hot-reload — and, since it generally can't know which file(s) your function's own import
     * depends on, also on every other file change (excluding its own generated
     * {@link VitePluginPixivnOptions.typeFilePath}), so a change to a manifest generated by
     * another plugin is picked up without any direct coupling between the two.
     *
     * Either way — plain value or function — once a manifest is registered, the plugin:
     * - writes `export const bundleIds` and `export const assetAliasIds` — `as const` runtime
     *   arrays of every bundle name and every asset alias found in the manifest — to
     *   {@link VitePluginPixivnOptions.typeFilePath}, and augments `PixivnBundleIds` /
     *   `PixivnAssetAliasIds` in `@drincs/pixi-vn/canvas` (the same `declare module` pattern used
     *   for `PixivnCharacterIds` / `PixivnLabelIds`), narrowing `BundleIdType` / `AssetAliasIdType`
     *   (also exported from `@drincs/pixi-vn/canvas`) from `string` to unions of known literals.
     * - seeds the dev-server's `GET /__pixi-vn/assets/manifest` endpoint with this manifest
     *   immediately, so it is available without the browser having to `POST` it first (see
     *   {@link PIXIVN_DEV_API_ASSETS_MANIFEST}). A later `POST` (deprecated) still overrides it.
     *
     * `api.setAssetsManifest(manifest)` remains available as a lower-level escape hatch for
     * pushing an already-computed manifest from outside this plugin entirely (e.g. from a
     * separate Vite plugin that doesn't need `ssrLoadModule` access).
     *
     * @example
     * ```ts
     * // vite.config.ts — a manifest merged from a generated file plus hand-written bundles
     * vitePluginPixivn({
     *   typeFilePath: "./src/pixi-vn.keys.gen.ts",
     *   assetsManifest: async (ssrLoadModule) => {
     *     const mod = await ssrLoadModule("/src/assets/index.ts");
     *     return mod.manifest;
     *   },
     * })
     * ```
     *
     * @example
     * ```ts
     * // vite.config.ts — a genuinely static manifest, known up front
     * vitePluginPixivn({
     *   assetsManifest: { bundles: [{ name: "ui", assets: { logo: "logo.png" } }] },
     *   typeFilePath: "./src/pixi-vn.keys.gen.ts",
     * })
     * ```
     */
    assetsManifest?: AssetsManifestOption;
}

/**
 * Creates a Vite plugin for Pixi'VN integration.
 *
 * **Static content loading**
 *
 * When {@link VitePluginPixivnOptions.content}, {@link VitePluginPixivnOptions.characters}, or
 * {@link VitePluginPixivnOptions.labels} are provided, the matched files are executed server-side
 * via Vite SSR at startup, populating `RegisteredCharacters`, `RegisteredLabels`, and any other
 * singletons before downstream plugins (such as `vitePluginInk`) run — including during
 * `vite build`.
 *
 * **Auto-generated type file**
 *
 * When {@link VitePluginPixivnOptions.typeFilePath} is provided, the plugin writes a
 * TypeScript declaration file that augments `PixivnCharacterIds` in `@drincs/pixi-vn/characters`
 * and `PixivnLabelIds` in `@drincs/pixi-vn/narration` with all currently known IDs.
 * This narrows `CharacterIdType` and `LabelIdType` from `string` to unions of known literals,
 * giving compile-time safety for character lookups, `narration.call`, `narration.jump`, etc.
 *
 * The file is regenerated whenever the character or label set changes (content reload or
 * external-label updates). It is **excluded from HMR** so regenerating it never triggers a page reload.
 *
 * **Auto-generated list file**
 *
 * When {@link VitePluginPixivnOptions.listFilePath} is provided, the plugin writes a
 * TypeScript file that exports runtime `as const` arrays of all currently known IDs:
 * `characterIds` and `labelIds`. These arrays can be used for runtime validation
 * (e.g. `z.enum(characterIds)`) and are regenerated on the same triggers as the type file.
 *
 * **Asset bundles / aliases**
 *
 * When a PIXI.js `AssetsManifest` is registered — via {@link VitePluginPixivnOptions.assetsManifest}
 * or, for manifests produced by an async asset pipeline, `api.setAssetsManifest(manifest)` — the
 * same {@link VitePluginPixivnOptions.typeFilePath} also gets `export const bundleIds` /
 * `export const assetAliasIds` (`as const` arrays) plus `declare module` augmentations for
 * `PixivnBundleIds` / `PixivnAssetAliasIds` in `@drincs/pixi-vn/canvas` — narrowing that module's
 * `BundleIdType` / `AssetAliasIdType` from `string` to unions of known literals, exactly like
 * `PixivnCharacterIds` / `PixivnLabelIds` narrow `CharacterIdType` / `LabelIdType` above. The
 * manifest also immediately backs the `GET /__pixi-vn/assets/manifest` endpoint below.
 *
 * **External label providers**
 *
 * Other Vite plugins can inject label IDs via the plugin API without needing to register
 * them through SSR-loaded modules:
 * - `api.setExternalLabels(providerId, labels)` — registers (or replaces) the label list for
 *   the given provider and regenerates the type file.
 * - `api.clearExternalLabels(providerId)` — removes all labels for the given provider and
 *   regenerates the type file.
 *
 * **Dev-server HTTP endpoints**
 *
 * - `GET  /__pixi-vn/characters` — retrieve registered characters
 * - `POST /__pixi-vn/characters` — *(deprecated)* update from client; use the `characters` option instead
 * - `GET  /__pixi-vn/labels` — retrieve narration labels
 * - `POST /__pixi-vn/labels` — *(deprecated)* update from client; use the `labels` / `content` option instead
 * - `GET  /__pixi-vn/assets/manifest` — retrieve PIXI assets manifest (immediately available
 *   when the `assetsManifest` option is set or `api.setAssetsManifest` has been called; otherwise
 *   404 until a client `POST`)
 * - `POST /__pixi-vn/assets/manifest` — *(deprecated)* update from client; use the
 *   `assetsManifest` option instead
 * - `GET  /__pixi-vn/canvas-options` — retrieve canvas rendering options
 * - `POST /__pixi-vn/canvas-options` — update canvas options from client
 *
 * **Plugin API** (consumed by `vitePluginInk`):
 * - `api.contentLoaded` — `Promise<void>` that resolves once all content modules have finished
 *   loading. Await this before generating JSON files.
 * - `api.characters` — the list of registered characters (populated after `contentLoaded`).
 * - `api.onReload(cb)` — register a callback that fires after every hot-content-reload.
 * - `api.setExternalLabels(providerId, labels)` — add/replace labels from an external provider.
 * - `api.clearExternalLabels(providerId)` — remove labels previously set for a provider.
 * - `api.setAssetsManifest(manifest)` — register/replace the assets manifest after
 *   plugin-creation time (e.g. once an async asset pipeline finishes); see
 *   {@link VitePluginPixivnOptions.assetsManifest}.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { vitePluginPixivn } from "@drincs/pixi-vn/vite";
 *
 * export default defineConfig({
 *   plugins: [
 *     vitePluginPixivn({
 *       content: "./src/content/index.ts",
 *       typeFilePath: "./src/pixi-vn.gen.d.ts",
 *     }),
 *   ],
 * });
 * ```
 *
 * @param options - Optional plugin configuration.
 * @returns A Vite plugin.
 */
export function vitePluginPixivn(options?: VitePluginPixivnOptions): Plugin {
    let resolvedConfig: ResolvedConfig | undefined;

    let contentLoadedResolve!: () => void;
    /**
     * Resolves once all content modules specified by the plugin options have been
     * loaded server-side.  `vitePluginInk` awaits this before compiling JSON files.
     */
    const contentLoaded = new Promise<void>((resolve) => {
        contentLoadedResolve = resolve;
    });

    const allPatterns = [
        ...asArray(options?.content),
        ...asArray(options?.characters),
        ...asArray(options?.labels),
    ];

    let ssrCharacters: CharacterInterface[] = [];
    let ssrLabels: string[] = [];
    const watchedFiles = new Set<string>();
    const reloadCallbacks: Array<() => void> = [];

    const assetsManifestIsFunction = typeof options?.assetsManifest === "function";

    // Holds whatever the `assetsManifest` option (or `api.setAssetsManifest`) most recently
    // resolved to. When `assetsManifest` is a plain value, this never changes after the initial
    // assignment. When it's a function, `refreshAssetsManifest` re-assigns it every time the
    // plugin (re)loads content or sees any other file change (see `hotUpdate` below) — its
    // derived id lists are recomputed from this variable on every `tryGenerateKeysFile()` call
    // rather than memoized once.
    let currentAssetsManifest: AssetsManifest | undefined =
        typeof options?.assetsManifest === "function" ? undefined : options?.assetsManifest;

    /**
     * Re-invokes the function form of `assetsManifest`, updating `currentAssetsManifest` and the
     * `GET /__pixi-vn/assets/manifest` dev-server state. No-op when `assetsManifest` is a plain
     * value (or unset) — callers still call `tryGenerateKeysFile()` themselves afterwards.
     */
    async function refreshAssetsManifest(
        ssrLoadModule: (id: string) => Promise<unknown>,
    ): Promise<void> {
        if (typeof options?.assetsManifest !== "function") return;
        try {
            const manifest = await options.assetsManifest(ssrLoadModule);
            currentAssetsManifest = manifest;
            state.manifest = manifest ?? null;
        } catch (error) {
            resolvedConfig?.logger.error(
                `${PLUGIN_PREFIX} Failed to resolve the assets manifest.`,
                {
                    error: error instanceof Error ? error : new Error(String(error)),
                    timestamp: true,
                },
            );
        }
    }

    /** Labels registered by external providers: providerId → label IDs */
    const externalLabels = new Map<string, string[]>();

    /** Returns the absolute path of the generated keys file, or null if not configured. */
    function getAbsKeysFilePath(): string | null {
        if (!options?.typeFilePath || !resolvedConfig) return null;
        const p = options.typeFilePath;
        return isAbsolute(p) ? p : resolve(resolvedConfig.root, p);
    }

    /** Returns the merged, deduplicated list of all label IDs (SSR + external). */
    function getAllLabelIds(): string[] {
        const all = [...ssrLabels, ...Array.from(externalLabels.values()).flat()];
        return Array.from(new Set(all));
    }

    /**
     * Writes the auto-generated TypeScript file that combines compile-time
     * module augmentations and runtime `as const` arrays for all known IDs.
     */
    function generateKeysFile(
        filePath: string,
        charIds: string[],
        labelIds: string[],
        bundleIds: string[],
        assetAliasIds: string[],
    ): void {
        mkdirSync(dirname(filePath), { recursive: true });
        const lines = [
            "/* eslint-disable */",
            "// noinspection JSUnusedGlobalSymbols",
            "// This file is auto-generated by @drincs/pixi-vn vite plugin. Do not edit manually.",
        ];
        if (charIds.length > 0) {
            lines.push(`declare module "@drincs/pixi-vn/characters" {`);
            lines.push(`    interface PixivnCharacterIds {`);
            for (const id of charIds) {
                lines.push(`        ${JSON.stringify(id)}: never;`);
            }
            lines.push(`    }`);
            lines.push(`}`);
        }
        if (labelIds.length > 0) {
            lines.push(`declare module "@drincs/pixi-vn/narration" {`);
            lines.push(`    interface PixivnLabelIds {`);
            for (const id of labelIds) {
                lines.push(`        ${JSON.stringify(id)}: never;`);
            }
            lines.push(`    }`);
            lines.push(`}`);
        }
        if (bundleIds.length > 0 || assetAliasIds.length > 0) {
            // Same augmentation pattern as PixivnCharacterIds/PixivnLabelIds above, narrowing
            // `BundleIdType`/`AssetAliasIdType` (exported from "@drincs/pixi-vn/canvas") from
            // `string` to a union of known literals.
            lines.push(`declare module "@drincs/pixi-vn/canvas" {`);
            if (bundleIds.length > 0) {
                lines.push(`    interface PixivnBundleIds {`);
                for (const id of bundleIds) {
                    lines.push(`        ${JSON.stringify(id)}: never;`);
                }
                lines.push(`    }`);
            }
            if (assetAliasIds.length > 0) {
                lines.push(`    interface PixivnAssetAliasIds {`);
                for (const id of assetAliasIds) {
                    lines.push(`        ${JSON.stringify(id)}: never;`);
                }
                lines.push(`    }`);
            }
            lines.push(`}`);
        }
        lines.push(`export const characterIds = ${JSON.stringify(charIds)} as const;`);
        {
            // Always emit the enum, even when empty: consumers such as
            // `zod.enum(characterIdsEnum)` throw at import time if this export is
            // missing entirely (e.g. `Object.values(undefined)`), which would abort
            // evaluation of every module still queued behind that import.
            const charEnum = Object.fromEntries(charIds.map((id) => [id, id]));
            lines.push(`export const characterIdsEnum = ${JSON.stringify(charEnum)} as const;`);
        }
        lines.push(`export const labelIds = ${JSON.stringify(labelIds)} as const;`);
        {
            const labelEnum = Object.fromEntries(labelIds.map((id) => [id, id]));
            lines.push(`export const labelIdsEnum = ${JSON.stringify(labelEnum)} as const;`);
        }
        lines.push(`export const bundleIds = ${JSON.stringify(bundleIds)} as const;`);
        {
            const bundleEnum = Object.fromEntries(bundleIds.map((id) => [id, id]));
            lines.push(`export const bundleIdsEnum = ${JSON.stringify(bundleEnum)} as const;`);
        }
        lines.push(`export const assetAliasIds = ${JSON.stringify(assetAliasIds)} as const;`);
        {
            const assetAliasEnum = Object.fromEntries(assetAliasIds.map((id) => [id, id]));
            lines.push(
                `export const assetAliasIdsEnum = ${JSON.stringify(assetAliasEnum)} as const;`,
            );
        }
        lines.push("");
        writeFileSync(filePath, lines.join("\n"), "utf-8");
    }

    /**
     * Syncs the in-memory dev-server state (`state.characters` / `state.labels`, backing the
     * `GET /__pixi-vn/characters` and `GET /__pixi-vn/labels` endpoints) with whatever is
     * currently known from SSR-loaded content plus external providers.
     *
     * Called from {@link tryGenerateKeysFile}, i.e. at every point where the registries may have
     * changed — content (re)load, external-label updates — and always *before* the typeFilePath
     * generation logic, so the dev-server endpoints never lag behind the generated keys file.
     */
    function syncState(): void {
        state.characters = ssrCharacters;
        state.labels = getAllLabelIds();
    }

    /** Regenerates the keys file if configured. Errors are logged and swallowed. */
    function tryGenerateKeysFile(): void {
        syncState();
        const absPath = getAbsKeysFilePath();
        if (!absPath) return;
        try {
            generateKeysFile(
                absPath,
                ssrCharacters.map((c) => c.id),
                getAllLabelIds(),
                getBundleIds(currentAssetsManifest),
                getAssetAliasIds(currentAssetsManifest),
            );
        } catch (error) {
            resolvedConfig?.logger.error(
                `${PLUGIN_PREFIX} Failed to write keys file "${absPath}".`,
                {
                    error: error instanceof Error ? error : new Error(String(error)),
                    timestamp: true,
                },
            );
        }
    }

    async function readSsrState(
        ssrLoadModule: (url: string) => Promise<unknown>,
        failedFiles: string[] = [],
    ): Promise<void> {
        // Read from the sub-paths rather than "@drincs/pixi-vn" (main): we only
        // need the registry singletons, not the full canvas/pixi.js surface.
        // With noExternal configured, sub-path imports share the same Vite SSR
        // module instances as the user content files, so the registered
        // characters/labels are visible here.
        try {
            const mod = (await ssrLoadModule("@drincs/pixi-vn/characters")) as {
                RegisteredCharacters?: { values(): CharacterInterface[] };
            };
            ssrCharacters = mod.RegisteredCharacters?.values() ?? [];
        } catch {
            ssrCharacters = [];
        }
        try {
            const mod = (await ssrLoadModule("@drincs/pixi-vn/narration")) as {
                RegisteredLabels?: { keys(): string[] };
            };
            ssrLabels = mod.RegisteredLabels?.keys() ?? [];
        } catch {
            ssrLabels = [];
        }
        if (failedFiles.length > 0) {
            const { charIds: staticCharIds, labelIds: staticLabelIds } =
                staticAnalyzeFiles(failedFiles);
            const existingCharIds = new Set(ssrCharacters.map((c) => c.id));
            const existingLabelIds = new Set(ssrLabels);
            for (const id of staticCharIds) {
                if (!existingCharIds.has(id)) ssrCharacters.push({ id } as CharacterInterface);
            }
            for (const id of staticLabelIds) {
                if (!existingLabelIds.has(id)) ssrLabels.push(id);
            }
        }
        const charIds = ssrCharacters.map((c) => c.id).join(", ") || "none";
        resolvedConfig?.logger.info(
            `${PLUGIN_PREFIX} ${pc.dim(`${ssrCharacters.length} character(s): [${charIds}], ${ssrLabels.length} label(s)`)}`,
            { timestamp: true },
        );
    }

    /**
     * Loads every matched `characters` / `labels` / `content` file via `ssrLoadModule`, in two
     * phases, and returns the combined list of files that failed to load (passed to
     * `readSsrState` for its regex-based fallback scan).
     *
     * `characters` and `labels` load first, followed immediately by `readSsrState` +
     * `tryGenerateKeysFile()` — so the generated keys file (and its `characterIdsEnum` /
     * `labelIdsEnum` exports) reflects the current registry *before* `content` loads. Without
     * this ordering, a `content` file that builds a validator from those generated exports (e.g.
     * `zod.enum(characterIdsEnum)` for a custom hashtag command) would see whatever the keys file
     * happened to contain from the *previous* run — empty on a first-ever run, or simply stale —
     * since the old single-pass loop only (re)generated the keys file after every content file,
     * including that one, had already executed.
     */
    async function loadFilesInPhases(
        ssrLoadModule: (url: string) => Promise<unknown>,
        root: string,
    ): Promise<string[]> {
        const failedFiles: string[] = [];

        const earlyPatterns = [...asArray(options?.characters), ...asArray(options?.labels)];
        const earlyFiles = await glob(earlyPatterns, {
            cwd: root,
            absolute: true,
            onlyFiles: true,
        });
        for (const file of earlyFiles) {
            watchedFiles.add(file);
            try {
                await ssrLoadModule(file);
            } catch {
                failedFiles.push(file);
            }
        }
        await readSsrState(ssrLoadModule, failedFiles);
        tryGenerateKeysFile();

        const contentFiles = await glob(asArray(options?.content), {
            cwd: root,
            absolute: true,
            onlyFiles: true,
        });
        for (const file of contentFiles) {
            watchedFiles.add(file);
            try {
                await ssrLoadModule(file);
            } catch {
                failedFiles.push(file);
            }
        }

        return failedFiles;
    }

    async function loadModules(
        ssrLoadModule: (url: string) => Promise<unknown>,
        root: string,
    ): Promise<void> {
        // Pre-load the singleton subpaths so the Vite SSR module graph has them
        // before user content files execute and register into them.  This mirrors
        // what reloadContent does and ensures readSsrState reads from the same
        // instances that user files populated.
        try {
            await ssrLoadModule("@drincs/pixi-vn/characters");
        } catch {
            /* ignore */
        }
        try {
            await ssrLoadModule("@drincs/pixi-vn/narration");
        } catch {
            /* ignore */
        }
        const failedFiles = await loadFilesInPhases(ssrLoadModule, root);
        await readSsrState(ssrLoadModule, failedFiles);
        await refreshAssetsManifest(ssrLoadModule);
        tryGenerateKeysFile();
        contentLoadedResolve();
    }

    async function reloadContent(server: ViteDevServer): Promise<void> {
        for (const file of watchedFiles) {
            for (const mod of server.moduleGraph.getModulesByFile(file) ?? []) {
                server.moduleGraph.invalidateModule(mod);
            }
        }
        try {
            const mod = (await server.ssrLoadModule("@drincs/pixi-vn/characters")) as {
                RegisteredCharacters?: { clear(): void };
            };
            mod.RegisteredCharacters?.clear?.();
        } catch {
            /* ignore */
        }
        try {
            const mod = (await server.ssrLoadModule("@drincs/pixi-vn/narration")) as {
                RegisteredLabels?: { clear(): void };
            };
            mod.RegisteredLabels?.clear?.();
        } catch {
            /* ignore */
        }
        const failedFiles = await loadFilesInPhases(
            (p) => server.ssrLoadModule(p),
            resolvedConfig!.root,
        );
        await readSsrState((p) => server.ssrLoadModule(p), failedFiles);
        await refreshAssetsManifest((p) => server.ssrLoadModule(p));
        tryGenerateKeysFile();
        for (const cb of reloadCallbacks) cb();
    }

    // ── in-memory state ──────────────────────────────────────────────────────
    const state: {
        characters: CharacterInterface[] | null;
        labels: string[] | null;
        manifest: AssetsManifest | null;
        canvasOptions: Partial<ApplicationOptions> | null;
    } = {
        characters: null,
        labels: null,
        // Seed from the plain-value form of the `assetsManifest` option, if provided, so `GET
        // /__pixi-vn/assets/manifest` returns it immediately instead of 404-ing until the
        // browser `POST`s one (see `VitePluginPixivnOptions.assetsManifest`). The function form
        // populates this asynchronously instead, via `refreshAssetsManifest`.
        manifest: currentAssetsManifest ?? null,
        canvasOptions: null,
    };

    function createStateHandler(key: keyof typeof state, stateName: string) {
        return (req: IncomingMessage, res: ServerResponse): void => {
            res.setHeader("Content-Type", "application/json");

            if (req.method === "GET") {
                const value = state[key];
                if (value === null) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: `${stateName} not initialized` }));
                    return;
                }
                res.statusCode = 200;
                res.end(JSON.stringify(value));
                return;
            }

            if (req.method === "POST") {
                let body = "";
                req.on("data", (chunk: Buffer) => {
                    body += chunk.toString();
                });
                req.on("end", () => {
                    try {
                        (state as Record<string, unknown>)[key] = JSON.parse(body);
                        res.statusCode = 201;
                        res.end(JSON.stringify({ message: `${stateName} updated successfully` }));
                    } catch {
                        res.statusCode = 400;
                        res.end(JSON.stringify({ error: `Invalid JSON format for ${stateName}` }));
                    }
                });
            }
        };
    }

    return {
        name: "vite-plugin-pixi-vn",
        // Run before vitePluginInk so configureServer and buildStart fire first
        // when both plugins share the same enforce group.
        enforce: "pre",

        api: {
            contentLoaded,
            get characters(): CharacterInterface[] {
                return ssrCharacters;
            },
            onReload(cb: () => void): void {
                reloadCallbacks.push(cb);
            },
            /**
             * Registers (or replaces) a set of label IDs contributed by an external provider.
             *
             * After the update, the auto-generated keys file (configured via
             * {@link VitePluginPixivnOptions.typeFilePath}) is regenerated so that
             * TypeScript immediately reflects the new set of valid label IDs.
             *
             * @param providerId - A unique identifier for the external provider (e.g. the
             *   name of the plugin that owns these labels).
             * @param labels - The list of label IDs contributed by this provider.
             */
            setExternalLabels(providerId: string, labels: string[]): void {
                externalLabels.set(providerId, labels);
                tryGenerateKeysFile();
            },
            /**
             * Removes all label IDs that were previously registered for the given provider.
             *
             * After the update, the auto-generated keys file is regenerated.
             *
             * @param providerId - The same identifier that was passed to
             *   {@link api.setExternalLabels}.
             */
            clearExternalLabels(providerId: string): void {
                externalLabels.delete(providerId);
                tryGenerateKeysFile();
            },
            /**
             * Registers (or replaces) the PIXI.js assets manifest, regenerating the keys file
             * (bundle/asset-alias ids and types) and updating the
             * `GET /__pixi-vn/assets/manifest` dev-server endpoint immediately.
             *
             * Use this instead of the {@link VitePluginPixivnOptions.assetsManifest} option when
             * the manifest isn't known synchronously at plugin-creation time — e.g. it's produced
             * by an async asset pipeline (such as `@assetpack/core`) that only finishes after
             * Vite's `plugins` array has already been built. Calling this from that pipeline's own
             * "on complete" hook keeps the keys file and dev-server endpoint in sync with every
             * subsequent run, not just the first.
             *
             * @param manifest - The PIXI.js `AssetsManifest` to register.
             */
            setAssetsManifest(manifest: AssetsManifest): void {
                currentAssetsManifest = manifest;
                state.manifest = manifest;
                tryGenerateKeysFile();
            },
        },

        config(_, env) {
            // When content patterns are configured, prevent Vite from externalising
            // @drincs/pixi-vn in SSR.  By default Vite loads node_modules via
            // Node's native resolver, which creates a separate module instance from
            // the one produced by ssrLoadModule — so RegisteredCharacters /
            // RegisteredLabels registered by user content files are invisible to
            // readSsrState.  noExternal forces all imports through Vite's SSR module
            // graph so every call shares the same singleton instances.
            if (env.command === "serve" && allPatterns.length > 0) {
                return { ssr: { noExternal: ["@drincs/pixi-vn"] } };
            }
        },

        configResolved(config) {
            resolvedConfig = config;
            // No content patterns and no manifest function to resolve — nothing to SSR-load,
            // resolve immediately. Still write the keys file here: a plain-value `assetsManifest`
            // is already known synchronously, so a manifest-only setup (no `content` /
            // `characters` / `labels`) would otherwise never get a keys file written at all.
            if (allPatterns.length === 0 && !assetsManifestIsFunction) {
                tryGenerateKeysFile();
                contentLoadedResolve();
            }
        },

        async buildStart() {
            // Dev mode uses configureServer + the existing dev server's ssrLoadModule.
            // Only create a temporary server during an actual build.
            if (
                resolvedConfig?.command !== "build" ||
                (allPatterns.length === 0 && !assetsManifestIsFunction)
            )
                return;

            const { createServer } = await import("vite");
            const tempServer = await createServer({
                root: resolvedConfig.root,
                configFile: false,
                // Forward the project's resolved alias configuration (e.g. `@/...` from
                // `resolve.tsconfigPaths` or a manual `resolve.alias`). Without this, the temp
                // server has no idea how to resolve those imports — any content file using them
                // (which in practice is most of them) silently fails to load, and the plugin
                // falls back to a much weaker regex-based scan of the failed file's raw source,
                // producing a badly incomplete keys file for `vite build` / `tsc -b`.
                resolve: resolvedConfig.resolve,
                server: { middlewareMode: true },
                appType: "custom",
                logLevel: "silent",
                optimizeDeps: { noDiscovery: true },
                ssr: { noExternal: ["@drincs/pixi-vn"] },
            });
            try {
                await loadModules((p) => tempServer.ssrLoadModule(p), resolvedConfig.root);
            } catch {
                contentLoadedResolve(); // always resolve so dependents are not blocked
            } finally {
                await tempServer.close();
            }
        },

        configureServer(server) {
            if (allPatterns.length > 0 || assetsManifestIsFunction) {
                void loadModules((p) => server.ssrLoadModule(p), resolvedConfig!.root).catch(() => {
                    contentLoadedResolve();
                });
            }

            /**
             * GET  /__pixi-vn/characters — retrieve registered characters.
             * POST /__pixi-vn/characters — @deprecated use the `characters` / `content` option instead.
             */
            server.middlewares.use(
                PIXIVN_DEV_API_CHARACTERS,
                createStateHandler("characters", "Characters"),
            );

            /**
             * GET  /__pixi-vn/labels — retrieve narration labels.
             * POST /__pixi-vn/labels — @deprecated use the `labels` / `content` option instead.
             */
            server.middlewares.use(PIXIVN_DEV_API_LABELS, createStateHandler("labels", "Labels"));

            /** GET / POST /__pixi-vn/assets/manifest */
            server.middlewares.use(
                PIXIVN_DEV_API_ASSETS_MANIFEST,
                createStateHandler("manifest", "Manifest"),
            );

            /** GET / POST /__pixi-vn/canvas-options */
            server.middlewares.use(
                PIXIVN_DEV_API_CANVAS_OPTIONS,
                createStateHandler("canvasOptions", "Canvas options"),
            );
        },

        hotUpdate({ file, server }) {
            // Prevent HMR for the auto-generated keys file so that regenerating
            // it never causes a full-page reload.
            const absKeysFilePath = getAbsKeysFilePath();
            if (absKeysFilePath && file === absKeysFilePath) {
                return [];
            }

            if (allPatterns.length > 0 && watchedFiles.has(file)) {
                void reloadContent(server).catch((error) => {
                    resolvedConfig?.logger.error(`${PLUGIN_PREFIX} Failed to reload content.`, {
                        error: error instanceof Error ? error : new Error(String(error)),
                        timestamp: true,
                    });
                });
                return [];
            }

            // The function form of `assetsManifest` can depend on arbitrary files this plugin
            // has no way to know about up front (e.g. a manifest generated by another plugin's
            // own asset pipeline). Re-invoke it on every other file change too, so it stays in
            // sync without needing any direct coupling between the two plugins. Cheap in
            // practice: Vite's own SSR module cache means this only does real work when a
            // dependency of the function's own import actually changed.
            if (assetsManifestIsFunction) {
                void refreshAssetsManifest((id) => server.ssrLoadModule(id))
                    .then(() => tryGenerateKeysFile())
                    .catch((error) => {
                        resolvedConfig?.logger.error(
                            `${PLUGIN_PREFIX} Failed to refresh the assets manifest.`,
                            {
                                error: error instanceof Error ? error : new Error(String(error)),
                                timestamp: true,
                            },
                        );
                    });
            }
        },
    };
}
