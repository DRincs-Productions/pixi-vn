import type { TextOptions } from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositionsExtension";
import { ListenerExtensionMemory } from "../../components/ListenerExtension";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas text memory
 */
export default interface TextMemory
    extends TextOptions, CanvasBaseItemMemory, AdditionalPositionsExtensionProps, ListenerExtensionMemory {}
