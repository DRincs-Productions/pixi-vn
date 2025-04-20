import { Assets, Texture } from "pixi.js";
import { logger } from "../../utils/log-utility";

/**
 * Get a texture from a url.
 * @param textureAlias is the url of the file.
 * @returns the texture of the image or video, or a text with the error.
 */
export async function getTexture(textureAlias?: string): Promise<Texture | void> {
    if (textureAlias === "EMPTY") {
        return;
    }
    if (!textureAlias) {
        logger.error("Texture not found", textureAlias);
        return;
    }
    if (Assets.cache.has(textureAlias)) {
        let texture = Assets.get(textureAlias);
        if (texture) {
            return texture;
        }
    }
    return Assets.load(textureAlias)
        .then((texture) => {
            if (!texture) {
                logger.error("Texture not found", textureAlias);
                return;
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                logger.error("File not is a file", textureAlias);
                return;
            }

            return texture;
        })
        .catch((e) => {
            logger.error("Error loading file", e);
            return;
        });
}
