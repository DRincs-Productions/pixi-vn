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
     * Path to the auto-generated TypeScript declaration file that writes the
     * `PixivnLabelIds` module augmentation for `@drincs/pixi-vn/narration`.
     *
     * When provided, the plugin generates (or overwrites) this file:
     * - after all content modules have been loaded at startup,
     * - after every hot-reload of a watched content file,
     * - whenever {@link Plugin.api.setExternalLabels} or
     *   {@link Plugin.api.clearExternalLabels} is called.
     *
     * The generated file is **excluded from HMR** so that updating it never
     * triggers a full-page reload.
     *
     * The path may be absolute or relative to Vite `root`.
     *
     * @example "./src/pixi-vn.gen.d.ts"
     */
    labelTypeFilePath?: string;
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
 * **Auto-generated label type file**
 *
 * When {@link VitePluginPixivnOptions.labelTypeFilePath} is provided, the plugin writes a
 * TypeScript declaration file that augments `PixivnLabelIds` in `@drincs/pixi-vn/narration`
 * with all currently known label IDs. This narrows the `LabelIdType` type from `string` to a
 * union of known literals, giving compile-time safety for `narration.call`, `narration.jump`,
 * `newLabel`, choice options, etc.
 *
 * The file is regenerated whenever the label set changes (content reload or external-label
 * updates). It is **excluded from HMR** so regenerating it never triggers a page reload.
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
 * - `GET  /__pixi-vn/assets/manifest` — retrieve PIXI assets manifest
 * - `POST /__pixi-vn/assets/manifest` — update assets manifest from client
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
 *       labelTypeFilePath: "./src/pixi-vn.gen.d.ts",
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

    /** Labels registered by external providers: providerId → label IDs */
    const externalLabels = new Map<string, string[]>();

    /** Returns the absolute path of the label-type file, or null if not configured. */
    function getAbsLabelTypePath(): string | null {
        if (!options?.labelTypeFilePath || !resolvedConfig) return null;
        const p = options.labelTypeFilePath;
        return isAbsolute(p) ? p : resolve(resolvedConfig.root, p);
    }

    /** Returns the merged, deduplicated list of all label IDs (SSR + external). */
    function getAllLabelIds(): string[] {
        const all = [...ssrLabels, ...Array.from(externalLabels.values()).flat()];
        return Array.from(new Set(all));
    }

    /**
     * Writes the auto-generated TypeScript declaration file that augments
     * `PixivnLabelIds` with the current set of known label IDs.
     *
     * @param filePath - Absolute path of the file to write.
     * @param labelIds - Label IDs to include in the augmentation.
     */
    function generateLabelTypeFile(filePath: string, labelIds: string[]): void {
        mkdirSync(dirname(filePath), { recursive: true });
        const lines = [
            "// This file is auto-generated by @drincs/pixi-vn vite plugin. Do not edit manually.",
        ];
        if (labelIds.length > 0) {
            lines.push(`declare module "@drincs/pixi-vn/narration" {`);
            lines.push(`    interface PixivnLabelIds {`);
            for (const id of labelIds) {
                lines.push(`        ${JSON.stringify(id)}: never;`);
            }
            lines.push(`    }`);
            lines.push(`}`);
        }
        lines.push("export {};");
        lines.push("");
        writeFileSync(filePath, lines.join("\n"), "utf-8");
    }

    /** Regenerates the label type file if configured. Errors are logged and swallowed. */
    function tryGenerateLabelTypeFile(): void {
        const absPath = getAbsLabelTypePath();
        if (!absPath) return;
        try {
            generateLabelTypeFile(absPath, getAllLabelIds());
        } catch (error) {
            resolvedConfig?.logger.error(
                `${PLUGIN_PREFIX} Failed to write label type file "${absPath}".`,
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
        // Read from "@drincs/pixi-vn" (not sub-paths) so we hit the same module
        // instance that user files import from — sub-paths are separate SSR instances.
        try {
            const mod = (await ssrLoadModule("@drincs/pixi-vn")) as {
                RegisteredCharacters?: { values(): CharacterInterface[] };
            };
            ssrCharacters = mod.RegisteredCharacters?.values() ?? [];
        } catch {
            ssrCharacters = [];
        }
        try {
            const mod = (await ssrLoadModule("@drincs/pixi-vn")) as {
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

    async function loadModules(
        ssrLoadModule: (url: string) => Promise<unknown>,
        root: string,
    ): Promise<void> {
        const files = await glob(allPatterns, { cwd: root, absolute: true, onlyFiles: true });
        const failedFiles: string[] = [];
        for (const file of files) {
            watchedFiles.add(file);
            try {
                await ssrLoadModule(file);
            } catch {
                failedFiles.push(file);
            }
        }
        await readSsrState(ssrLoadModule, failedFiles);
        tryGenerateLabelTypeFile();
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
                registeredCharacters?: { clear(): void };
            };
            mod.registeredCharacters?.clear?.();
        } catch {
            /* ignore */
        }
        const files = await glob(allPatterns, {
            cwd: resolvedConfig!.root,
            absolute: true,
            onlyFiles: true,
        });
        const failedFiles: string[] = [];
        for (const file of files) {
            watchedFiles.add(file);
            try {
                await server.ssrLoadModule(file);
            } catch {
                failedFiles.push(file);
            }
        }
        await readSsrState((p) => server.ssrLoadModule(p), failedFiles);
        tryGenerateLabelTypeFile();
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
        manifest: null,
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
             * After the update, the auto-generated label type file (configured via
             * {@link VitePluginPixivnOptions.labelTypeFilePath}) is regenerated so that
             * TypeScript immediately reflects the new set of valid label IDs.
             *
             * @param providerId - A unique identifier for the external provider (e.g. the
             *   name of the plugin that owns these labels).
             * @param labels - The list of label IDs contributed by this provider.
             */
            setExternalLabels(providerId: string, labels: string[]): void {
                externalLabels.set(providerId, labels);
                tryGenerateLabelTypeFile();
            },
            /**
             * Removes all label IDs that were previously registered for the given provider.
             *
             * After the update, the auto-generated label type file is regenerated.
             *
             * @param providerId - The same identifier that was passed to
             *   {@link api.setExternalLabels}.
             */
            clearExternalLabels(providerId: string): void {
                externalLabels.delete(providerId);
                tryGenerateLabelTypeFile();
            },
        },

        configResolved(config) {
            resolvedConfig = config;
            // No patterns — nothing to load, resolve immediately.
            if (allPatterns.length === 0) {
                contentLoadedResolve();
            }
        },

        async buildStart() {
            // Dev mode uses configureServer + the existing dev server's ssrLoadModule.
            // Only create a temporary server during an actual build.
            if (resolvedConfig?.command !== "build" || allPatterns.length === 0) return;

            const { createServer } = await import("vite");
            const tempServer = await createServer({
                root: resolvedConfig.root,
                configFile: false,
                server: { middlewareMode: true },
                appType: "custom",
                logLevel: "silent",
                optimizeDeps: { noDiscovery: true },
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
            if (allPatterns.length > 0) {
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
            // Prevent HMR for the auto-generated label type file so that regenerating
            // it never causes a full-page reload.
            const absLabelTypePath = getAbsLabelTypePath();
            if (absLabelTypePath && file === absLabelTypePath) {
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
        },
    };
}
