import type { TextOptions } from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "src/canvas/components/AdditionalPositionsExtension";
import { EventIdType } from "../../types/EventIdType";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas text memory
 */
export default interface TextMemory extends TextOptions, CanvasBaseItemMemory, AdditionalPositionsExtensionProps {
    onEvents: { [name: string]: EventIdType };
}
