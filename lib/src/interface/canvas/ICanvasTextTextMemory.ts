import { TextOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import ICanvasBaseMemory from "./ICanvasBaseMemory";

/**
 * Interface for the canvas text memory
 */
export default interface ICanvasTextMemory extends TextOptions, ICanvasBaseMemory {
    className: "CanvasText",
    onEvents: { [name: CanvasEventNamesType]: EventTagType }
}
