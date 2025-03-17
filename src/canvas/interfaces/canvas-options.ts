import { ContainerOptions, SpriteOptions } from "pixi.js";
import { AdditionalPositionsExtensionProps } from "../components/AdditionalPositions";
import { AnchorExtensionProps } from "../components/AnchorExtension";
import ContainerChild from "../types/ContainerChild";

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
