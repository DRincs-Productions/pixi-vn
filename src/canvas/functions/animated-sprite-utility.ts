import AnimatedSprite from "@canvas/components/AnimatedSprite";
import type { AnimatedSpriteSource } from "@canvas/interfaces/AnimatedSpriteSource";
import type { AnimatedSpriteOptions } from "@canvas/interfaces/canvas-options";
import { CANVAS_ANIMATED_SPRITE_ID } from "@constants";
import { PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { canvas } from "..";

function resolveSource(
    alias: string,
    source: AnimatedSpriteSource | string | undefined,
    options: AnimatedSpriteOptions | undefined,
): AnimatedSpriteSource {
    if (typeof source === "string") {
        return { spritesheet: source };
    }
    if (source) {
        return source;
    }
    if (PIXI.Assets.resolver.hasKey(alias)) {
        return { spritesheet: alias };
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
 * Add an animated sprite in the canvas.
 * Is the same that {@link showAnimatedSprite}, but the frames are not loaded.
 * If you want to show the animated sprite, then you need to use the function {@link AnimatedSprite.load}.
 * @param alias The unique alias of the animated sprite. You can use this alias to refer to this component.
 * @param source The frames of the animation: the alias/URL of a spritesheet, or an {@link AnimatedSpriteSource}.
 * If you don't provide it, the alias is used as the spritesheet alias.
 * @param options The options of the animated sprite.
 * @returns This function returns an {@link AnimatedSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `source` is not provided and `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * let fighter = addAnimatedSprite("fighter", "https://pixijs.com/assets/spritesheet/fighter.json", { loop: true });
 * await fighter.load();
 * fighter.play();
 * ```
 */
export function addAnimatedSprite(
    alias: string,
    source?: AnimatedSpriteSource | string,
    options?: AnimatedSpriteOptions,
): AnimatedSprite {
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
 * Add and show an animated sprite in the canvas. This function is a combination of {@link addAnimatedSprite} and {@link AnimatedSprite.load}.
 * The animation starts playing, unless `autoPlay: false` is passed in the options.
 * @param alias The unique alias of the animated sprite. You can use this alias to refer to this component.
 * @param source The frames of the animation: the alias/URL of a spritesheet, or an {@link AnimatedSpriteSource}.
 * If you don't provide it, the alias is used as the spritesheet alias.
 * @param options The options of the animated sprite.
 * @returns This function returns an {@link AnimatedSprite} that you can use to manipulate the component.
 * @throws {PixiError} when `source` is not provided and `alias` is not registered in the asset cache.
 * @example
 * ```ts
 * await showAnimatedSprite("explosion", "https://pixijs.com/assets/spritesheet/mc.json", { align: 0.5, anchor: 0.5 });
 * await showAnimatedSprite("fighter", { spritesheet: "fighter", frames: ["rollSequence0000.png", "rollSequence0001.png"] });
 * ```
 */
export async function showAnimatedSprite(
    alias: string,
    source?: AnimatedSpriteSource | string,
    options?: AnimatedSpriteOptions,
): Promise<AnimatedSprite> {
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
