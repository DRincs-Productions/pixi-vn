import type { Texture } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
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
    if (PIXI.Assets.cache.has(textureAlias)) {
        let texture = PIXI.Assets.get(textureAlias);
        if (texture) {
            return texture;
        }
    }
    return PIXI.Assets.load(textureAlias)
        .then((texture) => {
            if (!texture) {
                logger.error("Texture not found", textureAlias);
                return;
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof PIXI.Texture)) {
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
