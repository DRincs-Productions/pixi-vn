import { ICanvasBaseMemory } from "./canvas/ICanvasBaseMemory";

/**
 * This class is responsible for storing a PIXI DisplayObject.
 * And allow to save your memory in a game save.
 */
export interface ICanvasBase<T2 extends ICanvasBaseMemory> {
    /**
     * This method return the memory of the canvas element.
     */
    get memory(): T2
    /**
     * This method set the memory of the canvas element.
     */
    set memory(value: T2)
}
