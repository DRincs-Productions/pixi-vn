import { ContainerOptions } from "pixi.js";
import { ContainerChild } from "../../../types";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ContainerMemory<C extends ContainerChild = ContainerChild> extends ContainerOptions<C>, CanvasBaseItemMemory {
    elements: CanvasBaseItemMemory[],
}
