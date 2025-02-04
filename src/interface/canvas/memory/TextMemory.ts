import { TextOptions } from "pixi.js";
import { EventIdType } from "../../../types/EventIdType";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas text memory
 */
export default interface TextMemory extends TextOptions, CanvasBaseItemMemory {
    onEvents: { [name: string]: EventIdType };
}
