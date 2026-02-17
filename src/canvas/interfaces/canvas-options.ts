import type { CanvasTextOptions, ContainerOptions, SpriteOptions as PixiSpriteOptions } from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "../components/AdditionalPositionsExtension";
import { AnchorExtensionProps } from "../components/AnchorExtension";
import ContainerChild from "../types/ContainerChild";

export interface SpriteOptions extends Omit<PixiSpriteOptions, "on"> {}
export interface TextOptions extends Omit<CanvasTextOptions, "on">, AdditionalPositionsExtensionProps {}
export interface ImageContainerOptions<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>, AnchorExtensionProps, AdditionalPositionsExtensionProps {}
export interface ImageSpriteOptions extends SpriteOptions, AdditionalPositionsExtensionProps {}
export interface VideoSpriteOptions extends ImageSpriteOptions {
    loop?: boolean;
    paused?: boolean;
    currentTime?: number;
}
