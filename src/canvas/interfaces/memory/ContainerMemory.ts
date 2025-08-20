import { ContainerOptions } from "@drincs/pixi-vn/pixi.js";
import ContainerChild from "../../types/ContainerChild";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ContainerMemory<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>,
        CanvasBaseItemMemory {
    elements: CanvasBaseItemMemory[];
}
