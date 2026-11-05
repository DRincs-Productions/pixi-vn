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
/**
 * The options of an {@link AnimatedSprite}. The frames are not options: they are described by an
 * `AnimatedSpriteSource` and loaded with `load()`, so that the component can be saved and restored.
 * The `onComplete`, `onFrameChange` and `onLoop` callbacks are not options either, because they can't be saved:
 * listen to the `"complete"`, `"frameChange"` and `"loop"` events with `.on(...)` instead.
 */
export interface AnimatedSpriteOptions
    extends Omit<
            PixiAnimatedSpriteOptions,
            "on" | "textures" | "onComplete" | "onFrameChange" | "onLoop"
        >,
        AdditionalPositionsExtensionProps {}
