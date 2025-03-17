import { Assets, Texture } from "pixi.js";
import { videoFormats } from "../../constants";
import TextureMemory from "../interfaces/TextureMemory";

/**
 * Get the memory object of the PixiJS texture
 * @param texture PixiJS Texture object
 * @returns Memory object of the texture
 */
export function getTextureMemory(texture: Texture, alias?: string): TextureMemory {
    let url = texture.source.label;
    let textureMemory: TextureMemory = {
        url: url,
        alias: alias === url ? undefined : alias,
    };
    return textureMemory;
}

export function checkIfVideo(textureAlias: string): boolean {
    if (Assets.cache.has(textureAlias)) {
        let texture = Assets.get(textureAlias);
        if (texture && texture instanceof Texture) {
            textureAlias = texture.source.label;
        }
    }
    if (textureAlias.match(new RegExp(`(${videoFormats.join("|")})$`))) {
        return true;
    } else {
        return false;
    }
}
