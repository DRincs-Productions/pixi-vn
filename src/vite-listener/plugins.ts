import { canvas } from "@drincs/pixi-vn/canvas";
import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import { RegisteredLabels } from "@drincs/pixi-vn/narration";
import type { ApplicationOptions, AssetsManifest, UnresolvedAsset } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";

/**
 * Checks if the code is running in Vite development mode.
 * Uses indirect access to avoid TypeScript compilation issues with import.meta in commonjs modules.
 */
function isViteDevelopmentMode(): boolean {
    try {
        // Use Function constructor to indirectly access import.meta at runtime
        // This avoids direct eval while still bypassing TypeScript's static analysis
        return new Function(
            'return typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env?.DEV === true',
        )();
    } catch {
        return false;
    }
}

/**
 * Function that setup the pixivn vite data.
 * This function should be called in the client side, after the RegisteredCharacters and RegisteredLabels are populated.
 * **Note:** This function only runs in development mode and does nothing in production.
 */
export function setupPixivnViteData() {
    // Only run in development mode
    if (!isViteDevelopmentMode()) {
        return;
    }

    try {
        const characters = RegisteredCharacters.values();
        fetch("/pixi-vn/characters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(characters),
        });
    } catch (e) {}
    try {
        const labels = RegisteredLabels.keys();
        fetch("/pixi-vn/labels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(labels),
        });
    } catch (e) {}
    try {
        const assetMap = PIXI.Assets.resolver["_assetMap"];
        const bundles: { [key: string]: string[] } = PIXI.Assets.resolver["_bundles"];
        const manifest: AssetsManifest = {
            bundles: [],
        };
        Object.entries(bundles).forEach(([bundleName, assets]) => {
            let res: UnresolvedAsset[] = [];
            assets.forEach((asset) => {
                if (assetMap[asset]) {
                    const existing = assetMap[asset];
                    res = [...res, ...existing];
                }
            });
            manifest.bundles.push({
                name: bundleName,
                assets: res,
            });
        });
        fetch("/pixi-vn/assets/manifest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(manifest),
        });
    } catch (e) {}
    try {
        const options: Partial<ApplicationOptions> = {
            height: canvas.app.screen.height,
            width: canvas.app.screen.width,
        };
        fetch("/pixi-vn/canvas/options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options),
        });
    } catch (e) {}
}
