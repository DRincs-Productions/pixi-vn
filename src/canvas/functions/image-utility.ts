import { Assets } from "@drincs/pixi-vn/pixi.js";
import { canvas, ImageSpriteOptions } from "..";
import ImageSprite from "../components/ImageSprite";

/**
 * Add a image in the canvas.
 * Is the same that {@link showImage}, but the image is not shown.
 * If you want to show the image, then you need to use the function {@link ImageSprite.load()}.
 * @param alias is the unique alias of the image. You can use this alias to refer to this image
 * @param imageUrl is the url of the image. If you don't provide the url, then the alias is used as the url.
 * @param options The options of the image.
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
export function addImage(alias: string, imageUrl?: string, options?: ImageSpriteOptions): ImageSprite {
    if (!imageUrl) {
        if (Assets.resolver.hasKey(alias)) {
            imageUrl = alias;
        } else {
            throw new Error(`The image ${alias} does not exist in the cache.`);
        }
    }
    let oldMemory = { ...canvas.find(alias)?.memory, ...options };
    let component = new ImageSprite(options, imageUrl);
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true });
    return component;
}

/**
 * Add and show a image in the canvas. This function is a combination of {@link addImage}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param imageUrl The url of the image.
 * @param options The options of the image.
 * @returns A promise that is resolved when the image is loaded.
 * @example
 * ```typescript
 * let bunny1 = showImage("bunny1", "https://pixijs.com/assets/bunny1.png")
 * Assets.add({ alias: "bunny2", src: "https://pixijs.com/assets/bunny2.png" })
 * let bunny2 = showImage("bunny2")
 * ```
 */
export async function showImage(alias: string, imageUrl?: string, options?: ImageSpriteOptions): Promise<ImageSprite> {
    if (!imageUrl) {
        if (Assets.resolver.hasKey(alias)) {
            imageUrl = alias;
        } else {
            throw new Error(`The image ${alias} does not exist in the cache.`);
        }
    }
    let oldMemory = { ...canvas.find(alias)?.memory, ...options };
    let component = new ImageSprite(options, imageUrl);
    await component.load();
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true });
    return component;
}
