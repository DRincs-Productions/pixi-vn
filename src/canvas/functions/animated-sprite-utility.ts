import AnimatedSprite from "@canvas/components/AnimatedSprite";
import type { AnimatedSpriteSource } from "@canvas/interfaces/AnimatedSpriteSource";
import type { AnimatedSpriteOptions } from "@canvas/interfaces/canvas-options";
import { CANVAS_ANIMATED_SPRITE_ID } from "@constants";
import { PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { canvas } from "..";

const SOURCE_KEYS: (keyof AnimatedSpriteSource)[] = [
    "spritesheet",
    "animation",
    "frames",
    "useFrameDurations",
];

/**
 * Split the 2nd/3rd arguments of {@link addAnimatedSprite}/{@link showAnimatedSprite}, which accept both
 * `(alias, source?, options?)` and `(alias, options?)`. An object is a source if it has at least one
 * {@link AnimatedSpriteSource} key (these keys don't exist in {@link AnimatedSpriteOptions}).
 */
function splitSourceAndOptions(
    sourceOrOptions: AnimatedSpriteSource | AnimatedSpriteOptions | string | undefined,
    options: AnimatedSpriteOptions | undefined,
): {
    source: AnimatedSpriteSource | string | undefined;
    options: AnimatedSpriteOptions | undefined;
} {
    if (sourceOrOptions === undefined || typeof sourceOrOptions === "string") {
        return { source: sourceOrOptions, options };
    }
    if (SOURCE_KEYS.some((key) => key in sourceOrOptions)) {
        return { source: sourceOrOptions as AnimatedSpriteSource, options };
    }
    return { source: undefined, options: sourceOrOptions as AnimatedSpriteOptions };
}

function resolveSource(
    alias: string,
    source: AnimatedSpriteSource | string | undefined,
    options: AnimatedSpriteOptions | undefined,
): AnimatedSpriteSource {
    if (typeof source === "string") {
        return { spritesheet: source };
    }
    if (source?.spritesheet || (source?.frames && source.frames.length > 0)) {
        return source;
    }
    // no spritesheet and no frames: the alias is the spritesheet (e.g. `{ animation: "walk" }`)
    if (PIXI.Assets.resolver.hasKey(alias)) {
        return { ...source, spritesheet: alias };
    }
    throw new PixiError(
        "unregistered_asset",
        `The spritesheet ${alias} does not exist in the cache.`,
        "canvas",
        {
            pixivnId: CANVAS_ANIMATED_SPRITE_ID,
            ...options,
            label: alias,
        },
    );
}

/**
 * Add an animated sprite in the canvas, using `alias` as the spritesheet alias. The frames are not loaded: use {@link AnimatedSprite.load}.
 * @param alias The unique alias of the component, also used as the alias of the spritesheet (it must be registered in the asset cache or manifest).
 * @param options The options of the animated sprite.
 * @returns This function returns an {@link AnimatedSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "fighter", src: "https://pixijs.com/assets/spritesheet/fighter.json" });
 * const fighter = addAnimatedSprite("fighter", { align: 0.5, animationSpeed: 0.4 });
 * await fighter.load();
 * ```
 */
export function addAnimatedSprite(alias: string, options?: AnimatedSpriteOptions): AnimatedSprite;
/**
 * Add an animated sprite in the canvas.
 * Is the same that {@link showAnimatedSprite}, but the frames are not loaded.
 * If you want to show the animated sprite, then you need to use the function {@link AnimatedSprite.load}.
 * @param alias The unique alias of the animated sprite. You can use this alias to refer to this component.
 * @param source The frames of the animation: the alias/URL of a spritesheet, or an {@link AnimatedSpriteSource}.
 * If you don't provide it, or it has no `spritesheet` and no `frames` (e.g. `{ animation: "walk" }`), the alias is used as the spritesheet alias.
 * @param options The options of the animated sprite.
 * @returns This function returns an {@link AnimatedSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `source` is not provided and `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "fighter", src: "https://pixijs.com/assets/spritesheet/fighter.json" });
 *
 * // a different alias for the component: (alias, spritesheetAlias, options)
 * const myFighter = addAnimatedSprite("myFighter", "fighter", { loop: true });
 * await myFighter.load();
 * myFighter.play();
 * ```
 */
export function addAnimatedSprite(
    alias: string,
    source?: AnimatedSpriteSource | string,
    options?: AnimatedSpriteOptions,
): AnimatedSprite;
export function addAnimatedSprite(
    alias: string,
    sourceOrOptions?: AnimatedSpriteSource | AnimatedSpriteOptions | string,
    opts?: AnimatedSpriteOptions,
): AnimatedSprite {
    const { source, options } = splitSourceAndOptions(sourceOrOptions, opts);
    const animatedSource = resolveSource(alias, source, options);
    const oldMemory = { ...canvas.find(alias)?.memory, ...options };
    const component = new AnimatedSprite(options, animatedSource);
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true, zIndex: options?.zIndex });
    return component;
}

/**
 * Add and show an animated sprite in the canvas, using `alias` as the spritesheet alias. The animation starts playing, unless `autoPlay: false` is passed.
 * @param alias The unique alias of the component, also used as the alias of the spritesheet (it must be registered in the asset cache or manifest).
 * @param options The options of the animated sprite.
 * @returns This function returns an {@link AnimatedSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "fighter", src: "https://pixijs.com/assets/spritesheet/fighter.json" });
 * await showAnimatedSprite("fighter", { align: 0.5, animationSpeed: 0.4 });
 * ```
 */
export async function showAnimatedSprite(
    alias: string,
    options?: AnimatedSpriteOptions,
): Promise<AnimatedSprite>;
/**
 * Add and show an animated sprite in the canvas. This function is a combination of {@link addAnimatedSprite} and {@link AnimatedSprite.load}.
 * The animation starts playing, unless `autoPlay: false` is passed in the options.
 * @param alias The unique alias of the animated sprite. You can use this alias to refer to this component.
 * @param source The frames of the animation: the alias/URL of a spritesheet, or an {@link AnimatedSpriteSource}.
 * If you don't provide it, or it has no `spritesheet` and no `frames` (e.g. `{ animation: "walk" }`), the alias is used as the spritesheet alias.
 * @param options The options of the animated sprite.
 * @returns This function returns an {@link AnimatedSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `source` is not provided and `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * Assets.add({ alias: "fighter", src: "https://pixijs.com/assets/spritesheet/fighter.json" });
 *
 * // a different alias for the component: (alias, spritesheetAlias, options)
 * await showAnimatedSprite("myFighter", "fighter", { align: 0.5, anchor: 0.5 });
 * // only some frames of the spritesheet
 * await showAnimatedSprite("rolling", { spritesheet: "fighter", frames: ["rollSequence0000.png", "rollSequence0001.png"] });
 * ```
 */
export async function showAnimatedSprite(
    alias: string,
    source?: AnimatedSpriteSource | string,
    options?: AnimatedSpriteOptions,
): Promise<AnimatedSprite>;
export async function showAnimatedSprite(
    alias: string,
    sourceOrOptions?: AnimatedSpriteSource | AnimatedSpriteOptions | string,
    opts?: AnimatedSpriteOptions,
): Promise<AnimatedSprite> {
    const { source, options } = splitSourceAndOptions(sourceOrOptions, opts);
    const animatedSource = resolveSource(alias, source, options);
    const oldMemory = { ...canvas.find(alias)?.memory, ...options };
    const component = new AnimatedSprite({ autoPlay: true, ...options }, animatedSource);
    component.label = alias;
    await component.load();
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true, zIndex: options?.zIndex });
    return component;
}
