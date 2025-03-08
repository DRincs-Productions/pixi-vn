export {
    default as canvasComponentDecorator,
    /**
     * @deprecated Use canvasComponentDecorator
     */
    default as canvasElementDecorator,
} from "./decorators/canvas-element-decorator";
export { default as eventDecorator } from "./decorators/event-decorator";

export { shakeEffect } from "./functions/canvas-effect";
export {
    moveIn,
    moveOut,
    pushIn,
    pushOut,
    removeWithDissolve,
    /**
     * @deprecated Use `removeWithDissolve` instead
     */
    removeWithDissolve as removeWithDissolveTransition,
    removeWithFade,
    /**
     * @deprecated Use `removeWithFade` instead
     */
    removeWithFade as removeWithFadeTransition,
    showWithDissolve,
    /**
     * @deprecated Use `removeWithFade` instead
     */
    showWithDissolve as showWithDissolveTransition,
    showWithFade,
    /**
     * @deprecated Use `removeWithFade` instead
     */
    showWithFade as showWithFadeTransition,
    zoomIn,
    zoomOut,
} from "./functions/canvas-transition";
export { addImageCointainer, showImageContainer } from "./functions/image-container-utility";
export { addImage, loadImage, showImage } from "./functions/image-utility";
export { getTexture } from "./functions/texture-utility";
export { addVideo, loadVideo, showVideo } from "./functions/video-utility";
