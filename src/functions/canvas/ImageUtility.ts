import { Texture } from 'pixi.js';
import { CanvasImage } from '../../classes';
import { GameWindowManager } from '../../managers';
import { getTexture } from '../TextureUtility';

/**
 * Add a image in the canvas.
 * Is the same that {@link showImage}, but the image is not shown.
 * If you want to show the image, then you need to use the function {@link CanvasImage.load()}.
 * @param tag is the unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl is the url of the image.
 * @returns the container of the image.
 * @example
 * ```typescript
 * let alien = addImage("bunny1", "https://pixijs.com/assets/eggHead.png")
 * await alien.load()
 * ```
 */
export function addImage(tag: string, imageUrl: string): CanvasImage {
    let image = new CanvasImage()
    image.imageLink = imageUrl
    GameWindowManager.addCanvasElement(tag, image)
    return image
}

/**
 * Show a list of images in the canvas, at the same time.
 * @param canvasImages is a list of images to show.
 * @returns the list of images.
 */
export async function loadImage(canvasImages: CanvasImage[] | CanvasImage): Promise<CanvasImage[]> {
    if (!Array.isArray(canvasImages)) {
        return [canvasImages]
    }
    let promises: Promise<void | Texture>[] = Array<Promise<void | Texture>>(canvasImages.length)
    for (let i = 0; i < canvasImages.length; i++) {
        promises[i] = getTexture(canvasImages[i].imageLink)
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
 * @param tag The unique tag of the image. You can use this tag to refer to this image
 * @param imageUrl The url of the image.
 * @returns A promise that is resolved when the image is loaded.
 */
export async function showImage(tag: string, imageUrl: string): Promise<CanvasImage> {
    let image = addImage(tag, imageUrl)
    await image.load()
    return image
}
