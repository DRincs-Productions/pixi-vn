import { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositionsExtension";
import { SpriteBaseMemory } from "./SpriteMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export default interface ImageSpriteMemory extends SpriteBaseMemory, AdditionalPositionsExtensionProps {
    loadIsStarted: boolean;
}
