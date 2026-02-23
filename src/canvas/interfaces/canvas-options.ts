import type {
    CanvasTextOptions,
    ContainerOptions as PixiContainerOptions,
    SpriteOptions as PixiSpriteOptions,
} from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "../components/AdditionalPositionsExtension";
import { AnchorExtensionProps } from "../components/AnchorExtension";
import ContainerChild from "../types/ContainerChild";

export interface ContainerOptions<C extends ContainerChild = ContainerChild>
    extends Omit<PixiContainerOptions<C>, "on">, AnchorExtensionProps, AdditionalPositionsExtensionProps {}
export interface SpriteOptions extends Omit<PixiSpriteOptions, "on">, AdditionalPositionsExtensionProps {}
export interface TextOptions extends Omit<CanvasTextOptions, "on">, AdditionalPositionsExtensionProps {}
export interface ImageContainerOptions<C extends ContainerChild = ContainerChild> extends ContainerOptions<C> {}
export interface ImageSpriteOptions extends SpriteOptions {}
export interface VideoSpriteOptions extends ImageSpriteOptions {
    loop?: boolean;
    paused?: boolean;
    currentTime?: number;
}
