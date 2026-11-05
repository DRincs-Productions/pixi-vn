/**
 * A frame of an {@link AnimatedSpriteSource} with its own duration.
 */
export interface AnimatedSpriteFrameSource {
    /**
     * The frame name inside the spritesheet, or (when no spritesheet is set) the alias/URL of the texture.
     */
    texture: string;
    /**
     * The duration of the frame, in milliseconds.
     */
    time: number;
}

/**
 * A serializable description of the frames of an {@link AnimatedSprite}.
 * It only contains asset aliases/URLs and frame names, so it can be saved in the game state and used to
 * rebuild the animation when a save is loaded or the player goes back in the history.
 *
 * The frames are resolved in this order:
 * - `spritesheet` + `animation`: the frames of `spritesheet.animations[animation]`;
 * - `spritesheet` + `frames`: the listed frames of the spritesheet;
 * - `spritesheet` only: all the frames of the spritesheet, sorted in natural order (`frame2` before `frame10`);
 * - `frames` only: each frame is a texture alias or URL.
 * @example
 * ```ts
 * Assets.add({ alias: "explosion", src: "https://pixijs.com/assets/spritesheet/mc.json" });
 * // all the frames of a spritesheet
 * const explosion: AnimatedSpriteSource = { spritesheet: "explosion" };
 * // a named animation of a spritesheet
 * const walk: AnimatedSpriteSource = { spritesheet: "hero", animation: "walk" };
 * // some frames of a spritesheet, with custom durations
 * const blink: AnimatedSpriteSource = {
 *     spritesheet: "hero",
 *     frames: [{ texture: "eyes_open.png", time: 2000 }, { texture: "eyes_closed.png", time: 100 }],
 * };
 * // separate images
 * const flag: AnimatedSpriteSource = { frames: ["flag1", "flag2", "flag3"] };
 * ```
 */
export interface AnimatedSpriteSource {
    /**
     * The alias or URL of a spritesheet JSON (a PixiJS `Spritesheet`).
     */
    spritesheet?: string;
    /**
     * The name of an animation defined in the `animations` field of the spritesheet.
     * Requires {@link spritesheet}.
     */
    animation?: string;
    /**
     * The frames to use, in order. If {@link spritesheet} is set, they are frame names of the spritesheet,
     * otherwise they are texture aliases or URLs. Use an {@link AnimatedSpriteFrameSource} to set the duration
     * of a single frame.
     */
    frames?: (string | AnimatedSpriteFrameSource)[];
    /**
     * If `true`, each frame uses the `duration` (in milliseconds) stored in the spritesheet JSON, as exported
     * by Aseprite or TexturePacker. A frame without a `duration` lasts {@link DEFAULT_ANIMATED_SPRITE_FRAME_TIME} ms.
     * The `animationSpeed` of the component is still applied as a multiplier.
     * @default false
     */
    useFrameDurations?: boolean;
}
