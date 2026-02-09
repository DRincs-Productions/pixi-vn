import { canvas, CanvasBaseItemMemory } from "..";
import canvasComponentDecorator from "../decorators/canvas-element-decorator";

/**
 * This class is used to create a canvas element to add into a Pixi Application.
 * You can use {@link canvas.add()} to add this element into the application.
 * This class should be implemented and the memory method should be overridden.
 * You must use the {@link canvasComponentDecorator} to register the canvas in the game.
 * In Ren'Py is a displayable.
 * @example
 * ```typescript
 * const CANVAS_EXAMPLE_ID = "CanvasExample";
 *
 * \@canvasComponentDecorator({
 *     name: CANVAS_EXAMPLE_ID,
 * })
 * export class CanvasExample extends Container implements CanvasBaseItem<Memory> {
 *     get memory(): Memory {
 *         return {
 *             pixivnId: CANVAS_EXAMPLE_ID,
 *             // ... other properties
 *         }
 *     }
 *     async setMemory(value: Memory) {
 *         // ... set other properties
 *     }
 * }
 * ```
 */
export default class CanvasBaseItem<T2 extends CanvasBaseItemMemory> {
    constructor(..._options: any) {}
    /**
     * This method return the memory of the canvas element.
     */
    get memory(): T2 {
        throw new Error("[Pixi’VN] The method CanvasBaseItem.memory must be overridden");
    }
    /**
     * This method set the memory of the canvas element.
     */
    setMemory(_value: T2): Promise<void> | void {
        throw new Error("[Pixi’VN] The method CanvasBaseItem.setMemory must be overridden");
    }
    /**
     * Get the id of the canvas element. This variable is used in the system to get the canvas element by id
     */
    pixivnId: string = "canvas_element_id_not_set";
}
