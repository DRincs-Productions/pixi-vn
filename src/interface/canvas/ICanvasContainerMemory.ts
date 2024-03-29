import { ContainerOptions } from "pixi.js";
import ICanvasBaseMemory from "./ICanvasBaseMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ICanvasContainerMemory extends ContainerOptions, ICanvasBaseMemory {
    elements: ICanvasBaseMemory[],
}