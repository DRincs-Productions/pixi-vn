import { ContainerOptions, SpriteOptions, TextOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import TextureMemory from "./TextureMemory";

/**
 * Interface for the canvas base memory
 */
export interface CanvasBaseMemory {
    pixivnId: string,
}

/**
 * Interface for the canvas container memory
 */
export interface CanvasContainerMemory extends ContainerOptions, CanvasBaseMemory {
    elements: CanvasBaseMemory[],
}

export interface CanvasSpriteBaseMemory extends SpriteOptions, CanvasBaseMemory {
    textureImage: TextureMemory,
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}

/**
 * Interface for the canvas sprite memory
 */
export interface CanvasSpriteMemory extends CanvasSpriteBaseMemory { }

/**
 * Interface for the canvas text memory
 */
export interface CanvasTextMemory extends TextOptions, CanvasBaseMemory {
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}

/**
 * The memory of the image. It uses for save the state of the image.
 */
export interface CanvasImageMemory extends CanvasSpriteBaseMemory {
    imageLink: string,
}

/**
 * The memory of the video. It uses for save the state of the video.
 */
export interface CanvasVideoMemory extends CanvasImageMemory {
    loop: boolean,
    paused: boolean,
    currentTime: number,
}
