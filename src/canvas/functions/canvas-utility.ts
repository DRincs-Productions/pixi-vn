import { Assets, Texture } from "pixi.js";
import { videoFormats } from "../../constants";

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
