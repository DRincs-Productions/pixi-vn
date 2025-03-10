import { PointData } from "pixi.js";
import { ImageSprite } from "../../../canvas";
import { AdditionalPositionsExtensionProps } from "../../../canvas/components/AdditionalPositions";
import ContainerMemory from "./ContainerMemory";
import ImageSpriteMemory from "./ImageSpriteMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ImageContainerMemory extends ContainerMemory<ImageSprite>, AdditionalPositionsExtensionProps {
    elements: ImageSpriteMemory[];
    anchor?: PointData;
    loadIsStarted: boolean;
}
