import { Assets, Texture } from 'pixi.js';
import { ImageSprite } from '../../classes';
import { canvas } from '../../managers';
import { getTexture } from '../texture-utility';

/**
 * Add a image in the canvas.
 * Is the same that {@link showImage}, but the image is not shown.
 * If you want to show the image, then you need to use the function {@link ImageSprite.load()}.
 * @param alias is the unique alias of the image. You can use this alias to refer to this image
 * @param imageUrl is the url of the image. If you don't provide the url, then the alias is used as the url.
 * @returns the container of the image.
 * @example
 * ```typescript
 * let bunny1 = addImage("bunny1", "https://pixijs.com/assets/bunny1.png")
 * await bunny1.load()
 * Assets.add({ alias: "bunny2", src: "https://pixijs.com/assets/bunny2.png" })
 * let bunny2 = addImage("bunny2")
 * await bunny2.load()
 * ```
 */
export function addImage(alias: string, imageUrl?: string): ImageSprite {
    if (!imageUrl) {
        if (Assets.resolver.hasKey(alias)) {
            imageUrl = alias
        }
        else {
            throw new Error(`The image ${alias} does not exist in the cache.`)
        }
    }
    let image = new ImageSprite()
    image.textureAlias = imageUrl
    canvas.add(alias, image)
    return image
}

/**
 * @deprecated
 */
export async function loadImage(canvasImages: ImageSprite[] | ImageSprite): Promise<ImageSprite[]> {
    if (!Array.isArray(canvasImages)) {
        return [canvasImages]
    }
    let promises: Promise<void | Texture>[] = Array<Promise<void | Texture>>(canvasImages.length)
    for (let i = 0; i < canvasImages.length; i++) {
        promises[i] = getTexture(canvasImages[i].textureAlias)
    }
    // wait for all promises
    return Promise.all(promises).then((textures) => {
        return textures.map((texture, index) => {
            if (texture) {
                canvasImages[index].texture = texture
                return canvasImages[index]
            }
            canvasImages[index].load()
            return canvasImages[index]
        })
    })
}

/**
 * Add and show a image in the canvas. This function is a combination of {@link addImage} and {@link loadImage}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param imageUrl The url of the image.
 * @returns A promise that is resolved when the image is loaded.
 * @example
 * ```typescript
 * let bunny1 = showImage("bunny1", "https://pixijs.com/assets/bunny1.png")
 * Assets.add({ alias: "bunny2", src: "https://pixijs.com/assets/bunny2.png" })
 * let bunny2 = showImage("bunny2")
 * ```
 */
export async function showImage(alias: string, imageUrl?: string): Promise<ImageSprite> {
    let image = addImage(alias, imageUrl)
    await image.load()
    return image
}
