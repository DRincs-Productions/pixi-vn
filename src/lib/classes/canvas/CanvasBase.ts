import { DisplayObject } from "pixi.js"
import { ICanvasBaseMemory } from "../../interface/canvas/ICanvasBaseMemory"

/**
 * This class is responsible for storing a PIXI DisplayObject.
 * And allow to save your memory in a game save.
 */
export abstract class CanvasBase<T extends DisplayObject, T2 extends ICanvasBaseMemory> {
    pixiElement: T
    constructor(element: T) {
        this.pixiElement = element
    }
    /**
     * This method return the memory of the canvas element.
     */
    abstract get memory(): T2
    /**
     * This method set the memory of the canvas element.
     */
    abstract set memory(value: T2)
}
