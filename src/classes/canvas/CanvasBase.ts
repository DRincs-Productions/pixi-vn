import { Container } from "pixi.js";
import { canvasElementDecorator } from "../../decorators";
import { ICanvasBaseMemory } from "../../interface/canvas";

/**
 * This class is used to create a canvas element to add into a Pixi Application.
 * You can use GameWindowManager.addCanvasElement() to add this element into the application.
 * This class should be implemented and the memory method should be overridden.
 * You must use the {@link canvasElementDecorator} to register the canvas in the game.
 * In Ren'Py is a displayable.
 * @example
 * ```typescript
 * \@canvasElementDecorator() // this is equivalent to canvasElementDecorator("CanvasExample")
 * export class CanvasExample extends Container implements CanvasBase<ICanvasExampleMemory> {
 *     get memory(): ICanvasExampleMemory {
 *         return {
 *             className: "CanvasExample",
 *             // ... other properties
 *         }
 *     }
 *     set memory(value: ICanvasExampleMemory) {
 *         // ... set other properties
 *     }
 * }
 * ```
 */
export default class CanvasBase<T2 extends ICanvasBaseMemory> extends Container {
    /**
     * This method return the memory of the canvas element.
     */
    get memory(): T2 { throw new Error("[Pixi'VN] The method CanvasBase.memory must be overridden") }
    /**
     * This method set the memory of the canvas element.
     */
    set memory(_value: T2) { throw new Error("[Pixi'VN] The method CanvasBase.memory must be overridden") }
}
