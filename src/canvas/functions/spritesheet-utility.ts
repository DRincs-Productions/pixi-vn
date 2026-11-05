import { getTexture } from "@canvas/functions/texture-utility";
import type {
    AnimatedSpriteFrameSource,
    AnimatedSpriteSource,
} from "@canvas/interfaces/AnimatedSpriteSource";
import { PixiError } from "@drincs/pixi-vn/core";
import type { FrameObject, Spritesheet, Texture } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { logger } from "@utils/log-utility";

/**
 * The duration (in milliseconds) of a frame that has no duration, when frame durations are used.
 * It is the default frame duration of Aseprite.
 */
export const DEFAULT_ANIMATED_SPRITE_FRAME_TIME = 100;

/**
 * Get a spritesheet from its alias or URL. If it is not in the cache, it is loaded with `Assets.load`.
 * @param spritesheetAlias The alias or URL of the spritesheet JSON.
 * @returns The PixiJS `Spritesheet`.
 * @throws {PixiError} when the alias is missing, the asset can't be loaded, or the asset is not a `Spritesheet`.
 * @example
 * ```ts
 * Assets.add({ alias: "fighter", src: "https://pixijs.com/assets/spritesheet/fighter.json" });
 * const sheet = await getSpritesheet("fighter");
 * const textures = Object.values(sheet.textures);
 * ```
 */
export async function getSpritesheet(spritesheetAlias?: string): Promise<Spritesheet> {
    if (!spritesheetAlias) {
        logger.error("Spritesheet not found", spritesheetAlias);
        throw new PixiError("unregistered_asset", "Spritesheet not found");
    }
    let asset: unknown;
    if (PIXI.Assets.cache.has(spritesheetAlias)) {
        asset = PIXI.Assets.get(spritesheetAlias);
    }
    if (!asset) {
        try {
            asset = await PIXI.Assets.load(spritesheetAlias);
        } catch (e) {
            logger.error("Error loading spritesheet", e);
            throw new PixiError(
                "unregistered_asset",
                `Error loading spritesheet ${spritesheetAlias}`,
            );
        }
    }
    if (!(asset instanceof PIXI.Spritesheet)) {
        logger.error("File is not a Spritesheet", spritesheetAlias);
        throw new PixiError(
            "unregistered_asset",
            `The asset ${spritesheetAlias} is not a Spritesheet`,
        );
    }
    return asset;
}

/**
 * Find a frame texture in a spritesheet, including its linked sheets (multi-pack spritesheets).
 */
function findSpritesheetFrame(sheet: Spritesheet, name: string): Texture | undefined {
    const textures = sheet.textures as Record<string, Texture>;
    if (textures[name]) {
        return textures[name];
    }
    for (const linked of sheet.linkedSheets ?? []) {
        const texture = (linked.textures as Record<string, Texture>)[name];
        if (texture) {
            return texture;
        }
    }
    return undefined;
}

/**
 * Find the `duration` of a frame stored in the spritesheet JSON, including its linked sheets.
 */
function findSpritesheetFrameDuration(sheet: Spritesheet, name: string): number | undefined {
    for (const s of [sheet, ...(sheet.linkedSheets ?? [])]) {
        const frame = (s.data.frames as Record<string, { duration?: unknown }>)[name];
        if (frame && typeof frame.duration === "number") {
            return frame.duration;
        }
    }
    return undefined;
}

/**
 * Compare two frame names in natural order (`frame2` before `frame10`).
 */
function naturalCompare(a: string, b: string) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Resolve an {@link AnimatedSpriteSource} into the frames of a PixiJS `AnimatedSprite`.
 * @param source The description of the frames.
 * @returns A `Texture[]`, or a `FrameObject[]` if at least one frame has a duration
 * (a frame with `time`, or `useFrameDurations: true`).
 * @throws {PixiError} when the spritesheet, the animation, or a frame can't be found, or the source has no frames.
 * @example
 * ```ts
 * const frames = await getAnimatedSpriteFrames({ spritesheet: "hero", animation: "walk" });
 * const sprite = new AnimatedSprite({ textures: frames });
 * ```
 */
export async function getAnimatedSpriteFrames(
    source: AnimatedSpriteSource,
): Promise<Texture[] | FrameObject[]> {
    const { spritesheet, animation, frames, useFrameDurations = false } = source;
    const entries: { texture: Texture; time?: number }[] = [];

    if (spritesheet) {
        const sheet = await getSpritesheet(spritesheet);
        let names: (string | AnimatedSpriteFrameSource)[];
        if (animation) {
            const animationFrames = sheet.data.animations?.[animation];
            if (!animationFrames) {
                throw new PixiError(
                    "unregistered_asset",
                    `The animation ${animation} does not exist in the spritesheet ${spritesheet}`,
                );
            }
            names = animationFrames;
        } else if (frames && frames.length > 0) {
            names = frames;
        } else {
            names = Object.keys(sheet.data.frames).sort(naturalCompare);
        }
        for (const item of names) {
            const name = typeof item === "string" ? item : item.texture;
            const texture = findSpritesheetFrame(sheet, name);
            if (!texture) {
                throw new PixiError(
                    "unregistered_asset",
                    `The frame ${name} does not exist in the spritesheet ${spritesheet}`,
                );
            }
            let time = typeof item === "string" ? undefined : item.time;
            if (time === undefined && useFrameDurations) {
                time =
                    findSpritesheetFrameDuration(sheet, name) ?? DEFAULT_ANIMATED_SPRITE_FRAME_TIME;
            }
            entries.push({ texture, time });
        }
    } else if (frames && frames.length > 0) {
        for (const item of frames) {
            const alias = typeof item === "string" ? item : item.texture;
            const texture = await getTexture(alias);
            if (!texture) {
                throw new PixiError("unregistered_asset", `The texture ${alias} does not exist`);
            }
            entries.push({ texture, time: typeof item === "string" ? undefined : item.time });
        }
    }

    if (entries.length === 0) {
        throw new PixiError(
            "unregistered_asset",
            "The AnimatedSprite source has no frames: set `spritesheet` and/or `frames`",
        );
    }

    if (entries.some((e) => e.time !== undefined)) {
        return entries.map(({ texture, time }) => ({
            texture,
            time: time ?? DEFAULT_ANIMATED_SPRITE_FRAME_TIME,
        }));
    }
    return entries.map(({ texture }) => texture);
}
