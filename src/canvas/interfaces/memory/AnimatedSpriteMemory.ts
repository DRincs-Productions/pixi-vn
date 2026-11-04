import type { AnimatedSpriteSource } from "../AnimatedSpriteSource";
import type { SpriteBaseMemory } from "./SpriteMemory";

/**
 * The memory of an {@link AnimatedSprite}. It is used to save the state of the animation.
 * The `onComplete`, `onFrameChange` and `onLoop` callbacks are not saved.
 */
export default interface AnimatedSpriteMemory extends SpriteBaseMemory {
    /**
     * The description of the frames, used to rebuild the textures on restore.
     */
    source?: AnimatedSpriteSource;
    animationSpeed?: number;
    loop?: boolean;
    updateAnchor?: boolean;
    autoUpdate?: boolean;
    currentFrame?: number;
    playing?: boolean;
    loadIsStarted?: boolean;
}
