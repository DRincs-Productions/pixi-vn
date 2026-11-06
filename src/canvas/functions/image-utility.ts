import { PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { splitUrlAndOptions } from "@canvas/functions/add-arguments-utility";
import { canvas, type ImageSpriteOptions } from "..";
import { CANVAS_IMAGE_ID } from "../../constants";
import ImageSprite from "../components/ImageSprite";

/**
 * Add a image in the canvas, using `alias` as the image alias. The image is not shown: use {@link ImageSprite.load}.
 * @param alias The unique alias of the component, also used as the alias of the asset (it must be registered in the asset cache or manifest).
 * @param options The options of the image.
 * @returns This function returns an {@link ImageSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "bunny", src: "https://pixijs.com/assets/bunny.png" });
 * const bunny = addImage("bunny", { xAlign: 0.5 });
 * await bunny.load();
 * ```
 */
export function addImage(alias: string, options?: ImageSpriteOptions): ImageSprite;
/**
 * Add a image in the canvas.
 * Is the same that {@link showImage}, but the image is not shown.
 * If you want to show the image, then you need to use the function {@link ImageSprite.load}.
 * @param alias is the unique alias of the image. You can use this alias to refer to this image
 * @param imageUrl The url of the image. If you have initialized the "asset matrix", you can use the alias of the texture. If you don't provide the URL, then the alias is used as the URL.
 * @param options The options of the image.
 * @returns This function returns an {@link ImageSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `imageUrl` is not provided and `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "bunny", src: "https://pixijs.com/assets/bunny.png" });
 *
 * // "bunny" is the alias of the component and of the asset
 * const bunny1 = addImage("bunny");
 * await bunny1.load();
 * // a different alias for the component: (alias, assetAlias, options)
 * const bunny2 = addImage("bunny2", "bunny", { xAlign: 1 });
 * await bunny2.load();
 * ```
 */
export function addImage(
    alias: string,
    imageUrl?: string,
    options?: ImageSpriteOptions,
): ImageSprite;
export function addImage(
    alias: string,
    imageUrlOrOptions?: string | ImageSpriteOptions,
    opts?: ImageSpriteOptions,
): ImageSprite {
    const args = splitUrlAndOptions(imageUrlOrOptions, opts);
    let imageUrl = args.url;
    const options = args.options;
    if (!imageUrl) {
        if (PIXI.Assets.resolver.hasKey(alias)) {
            imageUrl = alias;
        } else {
            throw new PixiError(
                "unregistered_asset",
                `The image ${alias} does not exist in the cache.`,
                "canvas",
                {
                    pixivnId: CANVAS_IMAGE_ID,
                    ...options,
                    label: alias,
                },
            );
        }
    }
    const oldMemory = { ...canvas.find(alias)?.memory, ...options };
    const component = new ImageSprite(options, imageUrl);
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true, zIndex: options?.zIndex });
    return component;
}

/**
 * Add and show a image in the canvas, using `alias` as the image alias.
 * @param alias The unique alias of the component, also used as the alias of the asset (it must be registered in the asset cache or manifest).
 * @param options The options of the image.
 * @returns This function returns an {@link ImageSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "bunny", src: "https://pixijs.com/assets/bunny.png" });
 * await showImage("bunny", { xAlign: 0.5 });
 * ```
 */
export async function showImage(alias: string, options?: ImageSpriteOptions): Promise<ImageSprite>;
/**
 * Add and show a image in the canvas. This function is a combination of {@link addImage}.
 * @param alias The unique alias of the image. You can use this alias to refer to this image
 * @param imageUrl The url of the image. If you have initialized the "asset matrix", you can use the alias of the texture. If you don't provide the URL, then the alias is used as the URL.
 * @param options The options of the image.
 * @returns This function returns an {@link ImageSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `imageUrl` is not provided and `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "bunny", src: "https://pixijs.com/assets/bunny.png" });
 *
 * // "bunny" is the alias of the component and of the asset
 * const bunny1 = await showImage("bunny");
 * // a different alias for the component: (alias, assetAlias, options)
 * const bunny2 = await showImage("bunny2", "bunny", { xAlign: 1 });
 * ```
 */
export async function showImage(
    alias: string,
    imageUrl?: string,
    options?: ImageSpriteOptions,
): Promise<ImageSprite>;
export async function showImage(
    alias: string,
    imageUrlOrOptions?: string | ImageSpriteOptions,
    opts?: ImageSpriteOptions,
): Promise<ImageSprite> {
    const args = splitUrlAndOptions(imageUrlOrOptions, opts);
    let imageUrl = args.url;
    const options = args.options;
    if (!imageUrl) {
        if (PIXI.Assets.resolver.hasKey(alias)) {
            imageUrl = alias;
        } else {
            throw new PixiError(
                "unregistered_asset",
                `The image ${alias} does not exist in the cache.`,
                "canvas",
                {
                    pixivnId: CANVAS_IMAGE_ID,
                    ...options,
                    label: alias,
                },
            );
        }
    }
    const oldMemory = { ...canvas.find(alias)?.memory, ...options };
    const component = new ImageSprite(options, imageUrl);
    component.label = alias;
    await component.load();
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true, zIndex: options?.zIndex });
    return component;
}
