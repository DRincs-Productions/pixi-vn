import type { PointData } from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositions";
import ImageSprite from "../../components/ImageSprite";
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
