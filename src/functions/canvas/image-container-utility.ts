import { ImageContainer, ImageSprite } from '../../classes';
import { canvas } from '../../managers';

/**
 * Add a list of images in the container, after that, the images are added to the canvas.
 * Is the same that {@link showImageContainer}, but the image is not shown.
 * If you want to show the image, then you need to use the function {@link ImageSprite.load()}.
 * @param alias is the unique alias of the image. You can use this alias to refer to this image
 * @param imageUrls is the url of the image. If you don't provide the url, then the alias is used as the url.
 * @returns the container of the image.
 * @example
 * ```typescript
 * let bunny = addImageContainer("bunny", ["https://pixijs.com/assets/bunny-body.png", "https://pixijs.com/assets/bunny-eyes.png"])
 * await bunny.load()
 * ```
 */
export function addImageCointainer(alias: string, imageUrls: string[]): ImageContainer {
    let container = new ImageContainer(undefined, imageUrls)
    canvas.add(alias, container)
    return container
}

/**
 * Add a list of images in the container, after that, the images are added and shown in the canvas.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param imageUrls The url of the image.
 * @returns A promise that is resolved when the image is loaded.
 * @example
 * ```typescript
 * let bunny = showImageContainer("bunny", ["https://pixijs.com/assets/bunny-body.png", "https://pixijs.com/assets/bunny-eyes.png"])
 * ```
 */
export async function showImageContainer(alias: string, imageUrls: string[]): Promise<ImageContainer> {
    let container = addImageCointainer(alias, imageUrls)
    await container.load()
    return container
}