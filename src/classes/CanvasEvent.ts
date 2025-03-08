import { getEventInstanceById } from "../canvas/decorators/event-decorator";
import { eventDecorator } from "../decorators";
import { CanvasEventNamesType } from "../types";
import { EventIdType } from "../types/EventIdType";

/**
 * CanvasEvent is a class that is used to create a pixi event, and connect it to a canvas element, with on().
 * This class should be extended and the fn method should be overridden.
 * You must use the {@link eventDecorator} to register the event in the game.
 * @example
 * ```typescript
 * \@eventDecorator() // this is equivalent to eventDecorator("EventTest")
 * export class EventTest extends CanvasEvent<Sprite> {
 *     override fn(event: CanvasEventNamesType, sprite: Sprite): void {
 *         if (event === 'pointerdown') {
 *             sprite.scale.x *= 1.25;
 *             sprite.scale.y *= 1.25;
 *         }
 *     }
 * }
 * ```
 */
export default class CanvasEvent<C> {
    constructor() {
        this.id = this.constructor.prototype.id;
    }
    fn(_event: CanvasEventNamesType, _element: C) {
        throw new Error("[Pixi’VN] The method CanvasEvent.fn() must be overridden");
    }
    /**
     * Get the id of the event. This variable is used in the system to get the event by id, {@link getEventInstanceById}
     */
    id: EventIdType = "event_id_not_set";
}
