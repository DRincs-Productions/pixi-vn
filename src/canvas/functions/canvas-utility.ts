import { default as PIXI } from "@drincs/pixi-vn/pixi.js";

const VIDEO_EXTENSIONS = new Set([
    "mp4", "webm", "ogg", "ogv", "avi", "mov", "wmv",
    "flv", "mkv", "m4v", "3gp", "3g2", "ts", "mts",
]);

export function checkIfVideo(textureAlias: string): boolean {
    const cachedTexture = PIXI.Assets.cache.has(textureAlias)
        ? PIXI.Assets.get(textureAlias)
        : null;

    if (cachedTexture instanceof PIXI.Texture) {
        textureAlias = cachedTexture.source?.label || textureAlias;
    }

    return isVideoPath(textureAlias);
}

function isVideoPath(path: string): boolean {
    const ext = path.split(".").pop()?.toLowerCase();
    return ext !== undefined && VIDEO_EXTENSIONS.has(ext);
}
