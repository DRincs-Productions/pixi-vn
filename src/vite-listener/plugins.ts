import { canvas } from "@drincs/pixi-vn/canvas";
import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import { RegisteredLabels } from "@drincs/pixi-vn/narration";
import { ApplicationOptions, Assets, AssetsManifest, UnresolvedAsset } from "@drincs/pixi-vn/pixi.js";

/**
 * Function that setup the pixivn vite data.
 * This function should be called in the client side, after the RegisteredCharacters and RegisteredLabels are populated.
 * **Note:** This function only runs in development mode and does nothing in production.
 */
export function setupPixivnViteData() {
    // Only run in development mode
    // We check import.meta.env.DEV at runtime using eval to avoid TypeScript compilation issues
    try {
        // @ts-ignore - Using eval to bypass TypeScript checking for import.meta
        const isDev = eval('typeof import !== "undefined" && typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true');
        if (!isDev) {
            return;
        }
    } catch (e) {
        // If import.meta is not available (non-Vite environment), skip execution
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
        const assetMap = Assets.resolver["_assetMap"];
        const bundles: { [key: string]: string[] } = Assets.resolver["_bundles"];
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
