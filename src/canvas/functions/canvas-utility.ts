import { Assets, Texture } from "@drincs/pixi-vn/pixi.js";
import { lookup } from "mime-types";

export function checkIfVideo(textureAlias: string): boolean {
    const cachedTexture = Assets.cache.has(textureAlias) ? Assets.get(textureAlias) : null;

    if (cachedTexture instanceof Texture) {
        textureAlias = cachedTexture.source?.label || textureAlias;
    }

    return isVideoPath(textureAlias);
}

function isVideoPath(path: string): boolean {
    const type = lookup(path); // es: "video/mp4" o "image/png"
    return typeof type === "string" && type.startsWith("video/");
}
