import type { ContainerOptions } from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositionsExtension";
import { ListenerExtensionMemory } from "../../components/ListenerExtension";
import ContainerChild from "../../types/ContainerChild";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ContainerMemory<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>, CanvasBaseItemMemory, ListenerExtensionMemory, AdditionalPositionsExtensionProps {
    elements: CanvasBaseItemMemory[];
    index?: number;
}
