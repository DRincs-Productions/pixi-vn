import { TextOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import ICanvasBaseMemory from "./ICanvasBaseMemory";

/**
 * Interface for the canvas text memory
 */
export default interface ICanvasTextMemory extends TextOptions, ICanvasBaseMemory {
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}
