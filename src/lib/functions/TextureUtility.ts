import { Assets, Texture } from 'pixi.js';
import { STRING_ERRORS } from './ErrorUtility';

/**
 * Get a texture from a url.
 * @param imageUrl is the url of the image.
 * @returns the texture of the image, or a text with the error.
 */
export async function getTexture(imageUrl: string): Promise<Texture | string> {
    if (Assets.cache.has(imageUrl)) {
        return Assets.get(imageUrl)
    }
    return Assets.load(imageUrl)
        .then((texture) => {
            if (!texture) {
                console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
                return STRING_ERRORS.IMAGE_NOT_FOUND
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
                return STRING_ERRORS.FILE_NOT_IS_IMAGE
            }

            return texture
        })
        .catch(() => {
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return STRING_ERRORS.IMAGE_NOT_FOUND
        })
}
