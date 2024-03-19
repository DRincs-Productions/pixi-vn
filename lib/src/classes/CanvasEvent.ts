import { CanvasEventNamesType } from "../types/CanvasEventNamesType";

/**
 * CanvasEvent is a class that is used to create a pixi event, and connect it to a canvas element, with on().
 */
export default class CanvasEvent<C> {
    fn(_event: CanvasEventNamesType, _element: C) { };
}
