import CanvasManager from "./CanvasManager";
import CanvasUtilitiesStatic from "./CanvasUtilitiesStatic";
import CanvasManagerInterface from "./interfaces/CanvasManagerInterface";

// * This import must be imported before the ImageSprite import.
export { default as VideoSprite } from "./components/VideoSprite";

export { default as CanvasEvent } from "../canvas/classes/CanvasEvent";
export { default as ImageContainer } from "../canvas/components/ImageContainer";
export { default as CanvasManagerStatic } from "./CanvasManagerStatic";
export { CanvasBaseInterface, default as CanvasBaseItem } from "./classes/CanvasBaseItem";
export { default as Container } from "./components/Container";
export { default as ImageSprite } from "./components/ImageSprite";
export { default as Sprite } from "./components/Sprite";
export { default as Text } from "./components/Text";
export { canvasComponentDecorator, default as RegisteredCanvasComponent } from "./decorators/canvas-element-decorator";
export { default as eventDecorator } from "./decorators/event-decorator";
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
export { addImage, loadImage, showImage } from "./functions/image-utility";
export { getTexture } from "./functions/texture-utility";
export { addVideo, loadVideo, showVideo } from "./functions/video-utility";
export type { ImageContainerOptions, ImageSpriteOptions, VideoSpriteOptions } from "./interfaces/canvas-options";
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
export type { default as TextureMemory } from "./interfaces/TextureMemory";
export type {
    MoveInOutProps,
    PushInOutProps,
    ShowWithDissolveTransitionProps,
    ShowWithFadeTransitionProps,
    ZoomInOutProps,
} from "./interfaces/transition-props";
export * from "./tickers";
export type { default as CanvasEventNamesType } from "./types/CanvasEventNamesType";
export type { default as ContainerChild } from "./types/ContainerChild";
export type { PauseType } from "./types/PauseType";
export type { RepeatType } from "./types/RepeatType";
export { canvas };

const canvas: CanvasManagerInterface = new CanvasManager();
CanvasUtilitiesStatic.init({
    getScreen: () => {
        return canvas.screen;
    },
});
