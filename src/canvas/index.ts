import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import CanvasManager from "./CanvasManager";
import CanvasUtilitiesStatic from "./CanvasUtilitiesStatic";
import CanvasManagerInterface from "./interfaces/CanvasManagerInterface";
export const { Assets, Color, Rectangle, TextStyle, Texture, UPDATE_PRIORITY } = PIXI;
export type { ContainerOptions, TextureSourceLike, Ticker as TickerValue } from "@drincs/pixi-vn/pixi.js";

// * This import must be imported before the ImageSprite import.
export { default as VideoSprite } from "./components/VideoSprite";

export type { AnimationOptions as MotionAnimationOptions } from "motion";
export { default as ImageContainer } from "../canvas/components/ImageContainer";
export { default as CanvasManagerStatic } from "./CanvasManagerStatic";
export { default as CanvasBaseItem } from "./classes/CanvasBaseItem";
export { analizePositionsExtensionProps } from "./components/AdditionalPositionsExtension";
export type {
    default as AdditionalPositionsExtension,
    AdditionalPositionsExtensionProps,
} from "./components/AdditionalPositionsExtension";
export type { default as AnchorExtension, AnchorExtensionProps } from "./components/AnchorExtension";
export { default as Container } from "./components/Container";
export { default as ImageSprite } from "./components/ImageSprite";
export type { default as Layer } from "./components/Layer";
export { default as Sprite } from "./components/Sprite";
export { default as Text } from "./components/Text";
export {
    canvasComponentDecorator,
    default as RegisteredCanvasComponents,
    setMemoryContainer,
} from "./decorators/canvas-element-decorator";
export { eventDecorator, default as RegisteredEvents } from "./decorators/event-decorator";
export { shakeEffect } from "./functions/canvas-effect";
export {
    moveIn,
    moveOut,
    pushIn,
    pushOut,
    removeWithDissolve,
    removeWithFade,
    showWithDissolve,
    showWithFade,
    zoomIn,
    zoomOut,
} from "./functions/canvas-transition";
export { addImageCointainer, showImageContainer } from "./functions/image-container-utility";
export { addImage, showImage } from "./functions/image-utility";
export { showText } from "./functions/text-utility";
export { getTexture } from "./functions/texture-utility";
export { addVideo, showVideo } from "./functions/video-utility";
export type { default as AssetMemory } from "./interfaces/AssetMemory";
export type {
    ImageContainerOptions,
    ImageSpriteOptions,
    SpriteOptions,
    TextOptions,
    VideoSpriteOptions,
} from "./interfaces/canvas-options";
export { type CanvasBaseInterface } from "./interfaces/CanvasBaseInterface";
export type { default as CanvasGameState } from "./interfaces/CanvasGameState";
export type { default as CanvasManagerInterface } from "./interfaces/CanvasManagerInterface";
export type { ShakeEffectProps } from "./interfaces/effect-props";
export type { default as CanvasBaseItemMemory } from "./interfaces/memory/CanvasBaseItemMemory";
export type { default as ContainerMemory } from "./interfaces/memory/ContainerMemory";
export type { default as ImageContainerMemory } from "./interfaces/memory/ImageContainerMemory";
export type { default as ImageSpriteMemory } from "./interfaces/memory/ImageSpriteMemory";
export type { SpriteBaseMemory, default as SpriteMemory } from "./interfaces/memory/SpriteMemory";
export type { default as TextMemory } from "./interfaces/memory/TextMemory";
export type { default as VideoSpriteMemory } from "./interfaces/memory/VideoSpriteMemory";
export type {
    MoveInOutProps,
    PushInOutProps,
    ShowWithDissolveTransitionProps,
    ShowWithFadeTransitionProps,
    ZoomInOutProps,
} from "./interfaces/transition-props";
export * from "./tickers";
export type {
    default as AnimationOptions,
    AnimationSequenceOptions,
    KeyframesType,
    ObjectSegment,
    ObjectSegmentWithTransition,
    SequenceOptions,
} from "./types/AnimationOptions";
export type { default as ContainerChild } from "./types/ContainerChild";
export type { PauseType } from "./types/PauseType";
export type { RepeatType } from "./types/RepeatType";

const canvas: CanvasManagerInterface = new CanvasManager();
CanvasUtilitiesStatic.init({
    getScreen: () => {
        return canvas.screen;
    },
});

export { canvas };
