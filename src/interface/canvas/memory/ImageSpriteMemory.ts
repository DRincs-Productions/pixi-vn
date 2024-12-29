import { AdditionalPositionsExtensionProps } from "../../../classes/canvas/AdditionalPositions";
import { SpriteBaseMemory } from "./SpriteMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export default interface ImageSpriteMemory extends SpriteBaseMemory, AdditionalPositionsExtensionProps {
    /**
     * @deprecated use SpriteBaseMemory.textureAlias
     */
    imageLink?: string,
    loadIsStarted: boolean
}
