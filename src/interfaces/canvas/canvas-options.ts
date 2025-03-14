import { ContainerOptions, SpriteOptions } from "pixi.js";
import { AdditionalPositionsExtensionProps } from "../../canvas/components/AdditionalPositions";
import { AnchorExtensionProps } from "../../canvas/components/AnchorExtension";
import { ContainerChild } from "../../types";

export interface ImageContainerOptions<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>,
        AnchorExtensionProps,
        AdditionalPositionsExtensionProps {}
export interface ImageSpriteOptions extends SpriteOptions, AdditionalPositionsExtensionProps {}
export interface VideoSpriteOptions extends ImageSpriteOptions {
    loop?: boolean;
    paused?: boolean;
    currentTime?: number;
}
