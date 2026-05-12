import type { CharacterInterface } from "@drincs/pixi-vn";
import type { ApplicationOptions, AssetsManifest } from "@drincs/pixi-vn/pixi.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
    PIXIVN_DEV_API_ASSETS_MANIFEST,
    PIXIVN_DEV_API_CANVAS_OPTIONS,
    PIXIVN_DEV_API_CHARACTERS,
    PIXIVN_DEV_API_LABELS,
} from "./costants";

/**
 * Represents a Vite plugin configuration object.
 * Defines the structure for registering middleware and handling server requests.
 *
 * @typedef {Object} Plugin
 * @property {string} name - Unique identifier for the plugin
 * @property {"serve"} apply - Plugin application scope (development server only)
 * @property {Function} configureServer - Middleware configuration function
 */
type Plugin = {
    name: string;
    apply: "serve";
    configureServer: (server: {
        middlewares: {
            use: (
                path: string,
                handler: (req: IncomingMessage, res: ServerResponse) => void,
            ) => void;
        };
    }) => void;
};

/** @type {CharacterInterface[] | null} Cached registered characters */
const characters: CharacterInterface[] | null = null;

/** @type {string[] | null} Cached narration label names */
const labels: string[] | null = null;

/** @type {AssetsManifest | null} Cached PIXI assets manifest */
const manifest: AssetsManifest | null = null;

/** @type {Partial<ApplicationOptions> | null} Cached canvas rendering options */
const options: Partial<ApplicationOptions> | null = null;

/**
 * Creates a Vite development server plugin for Pixi VN integration.
 *
 * This plugin provides four API endpoints to sync game state between the client
 * and the development server. Only active in development mode (serve).
 *
 * **Endpoints:**
 * - `GET  /__pixi-vn/characters` - Retrieve cached registered characters
 * - `POST /__pixi-vn/characters` - Update registered characters from client
 * - `GET  /__pixi-vn/labels` - Retrieve cached narration labels
 * - `POST /__pixi-vn/labels` - Update narration labels from client
 * - `GET  /__pixi-vn/assets/manifest` - Retrieve PIXI assets manifest
 * - `POST /__pixi-vn/assets/manifest` - Update assets manifest from client
 * - `GET  /__pixi-vn/canvas-options` - Retrieve canvas rendering options
 * - `POST /__pixi-vn/canvas-options` - Update canvas options from client
 *
 * @returns {Plugin} Configured Vite plugin object
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { vitePluginPixivn } from '@drincs/pixi-vn/vite';
 *
 * export default defineConfig({
 *   plugins: [vitePluginPixivn()],
 * });
 * ```
 *
 * @public
 */
export function vitePluginPixivn(): Plugin {
    /**
     * Generic handler for creating middleware that stores/retrieves state.
     * Handles both GET (retrieve) and POST (update) operations.
     *
     * @param {T} stateRef - Reference object to state (mutated)
     * @param {string} stateName - Human-readable state name for logging
     * @returns {(req: IncomingMessage, res: ServerResponse) => void} Middleware handler
     * @template T
     */
    const createStateHandler = <T>(
        stateRef: { current: T | null },
        stateName: string,
    ) => {
        return (req: IncomingMessage, res: ServerResponse) => {
            res.setHeader("Content-Type", "application/json");

            if (req.method === "GET") {
                if (stateRef.current === null) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: `${stateName} not initialized` }));
                    return;
                }
                res.statusCode = 200;
                res.end(JSON.stringify(stateRef.current));
                return;
            }

            if (req.method === "POST") {
                let body = "";
                req.on("data", (chunk) => (body += chunk));
                req.on("end", () => {
                    try {
                        stateRef.current = JSON.parse(body);
                        res.statusCode = 201;
                        res.end(JSON.stringify({ message: `${stateName} updated successfully` }));
                    } catch (error) {
                        res.statusCode = 400;
                        res.end(JSON.stringify({ error: `Invalid JSON format for ${stateName}` }));
                    }
                });
            }
        };
    };

    return {
        name: "vite-plugin-pixi-vn",
        apply: "serve",
        configureServer(server) {
            // Characters endpoint
            server.middlewares.use(
                PIXIVN_DEV_API_CHARACTERS,
                createStateHandler({ current: characters }, "Characters"),
            );

            // Labels endpoint
            server.middlewares.use(
                PIXIVN_DEV_API_LABELS,
                createStateHandler({ current: labels }, "Labels"),
            );

            // Assets manifest endpoint
            server.middlewares.use(
                PIXIVN_DEV_API_ASSETS_MANIFEST,
                createStateHandler({ current: manifest }, "Manifest"),
            );

            // Canvas options endpoint
            server.middlewares.use(
                PIXIVN_DEV_API_CANVAS_OPTIONS,
                createStateHandler({ current: options }, "Canvas options"),
            );
        },
    };
}
