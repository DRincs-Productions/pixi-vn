import type { TextOptions } from "@drincs/pixi-vn/pixi.js";
import type { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositionsExtension";
import type { ListenerExtensionMemory } from "../../components/ListenerExtension";
import type CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas text memory
 */
export default interface TextMemory
    extends TextOptions,
        CanvasBaseItemMemory,
        AdditionalPositionsExtensionProps,
        ListenerExtensionMemory {}
