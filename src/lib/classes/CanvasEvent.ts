import { CanvasEventNamesType } from "../types/CanvasEventNamesType";
import { SupportedCanvasElement } from "../types/SupportedCanvasElement";

/**
 * CanvasEvent is a class that is used to create a pixi event, and connect it to a canvas element, with on().
 */
export class CanvasEvent {
    fn(_event: CanvasEventNamesType, _element: SupportedCanvasElement) { };
}
