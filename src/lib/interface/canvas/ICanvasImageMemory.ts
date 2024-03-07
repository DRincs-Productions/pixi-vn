import { SpriteOptions } from "pixi.js";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";

/**
 * The memory of the image. It uses for save the state of the image.
 */
export interface ICanvasImageMemory extends SpriteOptions, ICanvasBaseMemory {
    className: "CanvasImage" | "CanvasImageAsync",
    imageLink: string
}
