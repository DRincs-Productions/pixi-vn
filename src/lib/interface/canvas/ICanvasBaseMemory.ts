import { ContainerOptions } from "pixi.js";

/**
 * Interface for the canvas base memory
 */
export interface ICanvasBaseMemory extends ContainerOptions {
    className: string,
    elements: ICanvasBaseMemory[],
}
