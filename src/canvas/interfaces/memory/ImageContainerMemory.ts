import type { PointData } from "@drincs/pixi-vn/pixi.js";
import type ImageSprite from "../../components/ImageSprite";
import type ContainerMemory from "./ContainerMemory";
import type ImageSpriteMemory from "./ImageSpriteMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ImageContainerMemory extends ContainerMemory<ImageSprite> {
    elements: ImageSpriteMemory[];
    anchor?: PointData;
    loadIsStarted: boolean;
}
