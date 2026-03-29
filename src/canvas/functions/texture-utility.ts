import { PixiError } from "@drincs/pixi-vn/core";
import type { Texture } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { logger } from "../../utils/log-utility";

/**
 * Get a texture from a url.
 * @param textureAlias is the url of the file.
 * @returns the texture of the image or video, or `undefined` when `textureAlias` is the `"EMPTY"` sentinel value.
 * @throws {PixiError} when the alias is missing, the asset is not found in the cache/network, or the loaded resource is not a `Texture`.
 */
export async function getTexture(textureAlias?: string): Promise<Texture | undefined> {
    if (textureAlias === "EMPTY") {
        return;
    }
    if (!textureAlias) {
        logger.error("Texture not found", textureAlias);
        throw new PixiError("unregistered_asset", "Texture not found");
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
                throw new PixiError("unregistered_asset", "Texture not found");
            }
            // if texture is not a Texture, then it is a TextureResource
            if (!(texture instanceof PIXI.Texture)) {
                logger.error("File is not a Texture", textureAlias);
                throw new PixiError("unregistered_asset", "File is not a Texture");
            }

            return texture;
        })
        .catch((e) => {
            logger.error("Error loading file", e);
            throw new PixiError("unknown_element", "Error loading file");
        });
}
