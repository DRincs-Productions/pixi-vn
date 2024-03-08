import { ContainerOptions } from "pixi.js";
import { SupportedCanvasElementMemory } from "../../types/SupportedCanvasElement";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";

/**
 * Interface for the canvas container memory
 */
export interface ICanvasContainerMemory extends ContainerOptions, ICanvasBaseMemory {
    className: "CanvasContainer",
    elements: SupportedCanvasElementMemory[],
}