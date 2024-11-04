import { TextOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasBaseMemory from "./CanvasBaseMemory";

/**
 * Interface for the canvas text memory
 */
export default interface CanvasTextMemory extends TextOptions, CanvasBaseMemory {
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}
