import { TextOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../../types";
import { EventIdType } from "../../../types/EventIdType";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

/**
 * Interface for the canvas text memory
 */
export default interface TextMemory extends TextOptions, CanvasBaseItemMemory {
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}
