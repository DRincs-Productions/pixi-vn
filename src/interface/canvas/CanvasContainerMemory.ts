import { ContainerOptions } from "pixi.js";
import CanvasBaseMemory from "./CanvasBaseMemory";

/**
 * Interface for the canvas container memory
 */
export default interface CanvasContainerMemory extends ContainerOptions, CanvasBaseMemory {
    elements: CanvasBaseMemory[],
}