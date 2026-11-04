import type {
    AnimatedSpriteOptions as PixiAnimatedSpriteOptions,
    CanvasTextOptions,
    ContainerOptions as PixiContainerOptions,
    SpriteOptions as PixiSpriteOptions,
} from "@drincs/pixi-vn/pixi.js";
import type { AdditionalPositionsExtensionProps } from "../components/AdditionalPositionsExtension";
import type { AnchorExtensionProps } from "../components/AnchorExtension";
import type ContainerChild from "../types/ContainerChild";

export interface ContainerOptions<C extends ContainerChild = ContainerChild>
    extends Omit<PixiContainerOptions<C>, "on">,
        AnchorExtensionProps,
        AdditionalPositionsExtensionProps {}
export interface SpriteOptions
    extends Omit<PixiSpriteOptions, "on">,
        AdditionalPositionsExtensionProps {}
export interface TextOptions
    extends Omit<CanvasTextOptions, "on">,
        AdditionalPositionsExtensionProps {}
export interface ImageContainerOptions<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C> {}
export interface ImageSpriteOptions extends SpriteOptions {}
export interface VideoSpriteOptions extends ImageSpriteOptions {
    loop?: boolean;
    paused?: boolean;
    currentTime?: number;
}
export interface AnimatedSpriteOptions
    extends Omit<PixiAnimatedSpriteOptions, "on" | "textures">,
        AdditionalPositionsExtensionProps {
    /**
     * The frames to start with. Usually you don't pass them directly: describe the frames with an
     * `AnimatedSpriteSource` and call `load()`, so that the component can be saved and restored.
     */
    textures?: PixiAnimatedSpriteOptions["textures"];
}
