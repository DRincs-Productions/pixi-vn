import { CanvasEventNamesType } from "../types/CanvasEventNamesType";

/**
 * CanvasEvent is a class that is used to create a pixi event, and connect it to a canvas element, with on().
 * This class should be extended and the fn method should be overridden.
 * You must use the eventDecorator to register the event in the game.
 * @example
 * ```typescript
 * \@eventDecorator() // this is equivalent to eventDecorator("EventTest")
 * export class EventTest extends CanvasEvent<CanvasSprite> {
 *     override fn(event: CanvasEventNamesType, sprite: CanvasSprite): void {
 *         if (event === 'pointerdown') {
 *             sprite.scale.x *= 1.25;
 *             sprite.scale.y *= 1.25;
 *         }
 *     }
 * }
 * ```
 */
export class CanvasEvent<C> {
    fn(_event: CanvasEventNamesType, _element: C) { throw new Error("[Pixi'VM] The method CanvasEvent.fn() must be overridden") }
}
