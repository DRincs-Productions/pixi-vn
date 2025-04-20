import { Assets, Texture } from "pixi.js";
import { videoFormats } from "../../constants";

// Precompile the regular expression for video formats
const videoFormatRegex = new RegExp(`(${videoFormats.join("|")})$`);

export function checkIfVideo(textureAlias: string): boolean {
    const cachedTexture = Assets.cache.has(textureAlias) ? Assets.get(textureAlias) : null;

    if (cachedTexture instanceof Texture) {
        textureAlias = cachedTexture.source?.label || textureAlias;
    }

    return videoFormatRegex.test(textureAlias);
}
