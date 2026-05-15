import { canvas } from "@drincs/pixi-vn/canvas";
import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import { RegisteredLabels } from "@drincs/pixi-vn/narration";
import type { ApplicationOptions, AssetsManifest } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import {
    PIXIVN_DEV_API_ASSETS_MANIFEST,
    PIXIVN_DEV_API_CANVAS_OPTIONS,
    PIXIVN_DEV_API_CHARACTERS,
    PIXIVN_DEV_API_LABELS,
} from "../vite/costants";

/**
 * Sends a POST request to the development API endpoint with error handling.
 *
 * @param {string} endpoint - The API endpoint URL
 * @param {unknown} data - The data to send as JSON
 * @param {string} [dataName="data"] - Human-readable name of the data being sent (for logging)
 * @private
 */
function sendToDevApi(endpoint: string, data: unknown, dataName: string = "data"): void {
    try {
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).catch((error) => {
            console.warn(`Failed to send ${dataName} to ${endpoint}:`, error);
        });
    } catch (error) {
        console.warn(`Error sending ${dataName} to ${endpoint}:`, error);
    }
}

/**
 * Builds the PIXI assets manifest from the resolver's internal state.
 *
 * @returns {AssetsManifest} The constructed assets manifest
 * @private
 */
function buildAssetsManifest(): AssetsManifest {
    const assetMap = PIXI.Assets.resolver["_assetMap"];
    const bundles: { [key: string]: string[] } = PIXI.Assets.resolver["_bundles"];

    return {
        bundles: Object.entries(bundles).map(([bundleName, assets]) => ({
            name: bundleName,
            assets: assets.flatMap((asset) => assetMap[asset] ?? []),
        })),
    };
}

/**
 * Checks if the current runtime is Vite development mode.
 * Detects Vite dev client script injected in development.
 * Assumes default Vite client path starts with `/@vite/client`.
 *
 * @returns {boolean}
 * @public
 */
export function isViteDevelopmentMode(): boolean {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return false;
    }

    return Boolean(document.querySelector('script[src^="/@vite/client"]'));
}

/**
 * Initializes Pixi VN development tools by syncing game state with the Vite dev server.
 * Sends registered characters, labels, assets manifest, and canvas options.
 *
 * **Note:** This function only operates in Vite development mode and is a no-op in production.
 *
 * **Call this function:** After RegisteredCharacters and RegisteredLabels are populated,
 * typically in your client-side initialization code.
 *
 * @example
 * ```typescript
 * // In your main game initialization file
 * import { setupPixivnViteData } from '@drincs/pixi-vn/vite-listener';
 *
 * await Promise.all([import("@/content")]);
 * // After game setup
 * setupPixivnViteData();
 * ```
 *
 * @returns {void}
 * @public
 */
export function setupPixivnViteData(): void {
    if (!isViteDevelopmentMode()) {
        return;
    }

    try {
        const characters = RegisteredCharacters.values();
        sendToDevApi(PIXIVN_DEV_API_CHARACTERS, characters, "characters");
    } catch (error) {
        console.warn("Error collecting characters:", error);
    }

    try {
        const labels = RegisteredLabels.keys();
        sendToDevApi(PIXIVN_DEV_API_LABELS, labels, "labels");
    } catch (error) {
        console.warn("Error collecting labels:", error);
    }

    try {
        const manifest = buildAssetsManifest();
        sendToDevApi(PIXIVN_DEV_API_ASSETS_MANIFEST, manifest, "assets manifest");
    } catch (error) {
        console.warn("Error collecting assets manifest:", error);
    }

    try {
        const options: Partial<ApplicationOptions> = {
            height: canvas.app.screen.height,
            width: canvas.app.screen.width,
        };
        sendToDevApi(PIXIVN_DEV_API_CANVAS_OPTIONS, options, "canvas options");
    } catch (error) {
        console.warn("Error collecting canvas options:", error);
    }
}
