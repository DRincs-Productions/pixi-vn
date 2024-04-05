import { TextOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventIdType } from "../../types/EventIdType";
import ICanvasBaseMemory from "./ICanvasBaseMemory";

/**
 * Interface for the canvas text memory
 */
export default interface ICanvasTextMemory extends TextOptions, ICanvasBaseMemory {
    className: "CanvasText",
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}
