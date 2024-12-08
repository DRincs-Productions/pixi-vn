import { Container as PixiContainer, PointData } from "pixi.js";
import { canvasElementDecorator } from "../../decorators";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { CanvasBaseItemMemory } from "../../interface";
import { canvas } from "../../managers";

/**
 * This class is used to create a canvas element to add into a Pixi Application.
 * You can use {@link canvas.add()} to add this element into the application.
 * This class should be implemented and the memory method should be overridden.
 * You must use the {@link canvasElementDecorator} to register the canvas in the game.
 * In Ren'Py is a displayable.
 * @example
 * ```typescript
 * \@canvasElementDecorator() // this is equivalent to canvasElementDecorator("CanvasExample")
 * export class CanvasExample extends Container implements CanvasBaseItem<ICanvasExampleMemory> {
 *     get memory(): ICanvasExampleMemory {
 *         return {
 *             pixivnId: "CanvasExample",
 *             // ... other properties
 *         }
 *     }
 *     set memory(value: ICanvasExampleMemory) {
 *         // ... set other properties
 *     }
 * }
 * ```
 */
export default class CanvasBaseItem<T2 extends CanvasBaseItemMemory> extends PixiContainer {
    /**
     * This method return the memory of the canvas element.
     */
    get memory(): T2 { throw new Error("[Pixi’VN] The method CanvasBaseItem.memory must be overridden") }
    /**
     * This method set the memory of the canvas element.
     */
    set memory(_value: T2) { throw new Error("[Pixi’VN] The method CanvasBaseItems.memory must be overridden") }
    /**
     * Get the id of the canvas element. This variable is used in the system to get the canvas element by id, {@link getCanvasElementInstanceById}
     */
    pixivnId: string = "canvas_element_id_not_set"
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    set align(value: PointData | number) {
        if (typeof value === "number") {
            this.x = value
            this.y = value
        } else {
            this.x = value.x
            this.y = value.y
        }
    }
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    set xAlign(value: number) {
        this.x = value * (canvas.screen.width - this.width - this.pivot.x)
    }
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    set yAlign(value: number) {
        this.y = value * (canvas.screen.height - this.height - this.pivot.y)
    }
}
