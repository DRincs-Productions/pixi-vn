import { ICanvasBaseMemory } from "../../interface/canvas/ICanvasBaseMemory";
import { SupportedCanvasElement } from "../../types/SupportedCanvasElement";

/**
 * This class is responsible for storing a PIXI DisplayObject.
 * And allow to save your memory in a game save.
 */
export abstract class CanvasBase<T2 extends ICanvasBaseMemory> {
    /**
     * This method return the memory of the canvas element.
     */
    abstract get memory(): T2
    /**
     * This method set the memory of the canvas element.
     */
    abstract set memory(value: T2)
    abstract addCanvasChild<U extends SupportedCanvasElement[]>(...children: U): U[0]
}
