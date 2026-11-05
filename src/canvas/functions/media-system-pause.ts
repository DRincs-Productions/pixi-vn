import type { Sprite, Texture } from "@drincs/pixi-vn/pixi.js";

/*
 * State shared by `canvas.pause()`/`canvas.resume()` and the components they suspend. This module is a
 * leaf (type-only imports), so `CanvasManager` doesn't need to import the components themselves.
 */

/**
 * The `HTMLVideoElement` of a texture, if it is a video texture.
 * @internal
 */
export function getVideoElement(texture?: Texture | null): HTMLVideoElement | undefined {
    const resource = texture?.source?.resource;
    if (typeof HTMLVideoElement !== "undefined" && resource instanceof HTMLVideoElement) {
        return resource;
    }
    return undefined;
}

/**
 * A component whose animation `canvas.pause()` can freeze without changing the playback requested by
 * the game (the pixi-vn `AnimatedSprite`).
 * @internal
 */
export interface SystemPausable {
    systemPaused: boolean;
}
/** @internal */
export function isSystemPausable(element: object): element is SystemPausable {
    return typeof (element as Partial<SystemPausable>).systemPaused === "boolean";
}

/**
 * The video elements paused by `canvas.pause()`. Like `SoundRegistry.systemPausedAliases`, this
 * temporary suspension is kept apart from the playback requested by the game:
 * - `play`: whether `canvas.resume()` plays the video again. It starts as "the video was playing" and is
 *   updated by `VideoSprite.play()`/`pause()` called while the canvas is paused, so they are not lost.
 * - `sprites`: the sprites of the game layer showing the video when it was paused. The video is played
 *   again only if one of them still shows it, and `VideoSprite.play()` waits for `canvas.resume()` only
 *   on these sprites.
 *
 * The state is kept per video element, because several sprites can share one.
 * @internal
 */
export const systemPausedVideos = new Map<HTMLVideoElement, { play: boolean; sprites: Sprite[] }>();
