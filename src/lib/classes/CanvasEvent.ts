import { CanvasEventNamesType } from "../types/CanvasEventNamesType";
import { CanvasBase } from "./canvas/CanvasBase";

/**
 * CanvasEvent is a class that is used to create a pixi event, and connect it to a canvas element, with on().
 */
export class CanvasEvent<C extends CanvasBase<any, any>> {
    fn(_event: CanvasEventNamesType, _element: C) { };
}
