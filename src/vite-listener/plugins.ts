import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import { RegisteredLabels } from "@drincs/pixi-vn/narration";
import { Assets, AssetsManifest, UnresolvedAsset } from "@drincs/pixi-vn/pixi.js";

/**
 * Function that setup the pixivn vite data.
 * This function should be called in the client side, after the RegisteredCharacters and RegisteredLabels are populated.
 */
export function setupPixivnViteData() {
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
}
