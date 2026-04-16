import type { ContainerOptions } from "@drincs/pixi-vn/pixi.js";
import type { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositionsExtension";
import type { ListenerExtensionMemory } from "../../components/ListenerExtension";
import type ContainerChild from "../../types/ContainerChild";
import type CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas container memory
 */
export default interface ContainerMemory<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>,
        CanvasBaseItemMemory,
        ListenerExtensionMemory,
        AdditionalPositionsExtensionProps {
    /**
     * The elements contained in this container
     */
    elements: CanvasBaseItemMemory[];
}
