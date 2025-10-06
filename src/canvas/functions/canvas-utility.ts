import { Assets, Texture } from "@drincs/pixi-vn/pixi.js";
import db from "mime-db";

export function checkIfVideo(textureAlias: string): boolean {
    const cachedTexture = Assets.cache.has(textureAlias) ? Assets.get(textureAlias) : null;

    if (cachedTexture instanceof Texture) {
        textureAlias = cachedTexture.source?.label || textureAlias;
    }

    return isVideoPath(textureAlias);
}

function isVideoPath(path: string): boolean {
    const ext = path.split(".").pop()?.toLowerCase();
    if (!ext) return false;

    for (const [mime, data] of Object.entries(db)) {
        if (data.extensions?.includes(ext) && mime.startsWith("video/")) {
            return true;
        }
    }
    return false;
}
