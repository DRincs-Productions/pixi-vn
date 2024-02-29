import { DisplayObject, ObservablePoint } from "pixi.js"
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

    get x() {
        return this.pixiElement.x
    }
    set x(value: number) {
        this.pixiElement.x = value
    }
    get y() {
        return this.pixiElement.y
    }
    set y(value: number) {
        this.pixiElement.y = value
    }
    get rotation() {
        return this.pixiElement.rotation
    }
    set rotation(value: number) {
        this.pixiElement.rotation = value
    }
    get pivot() {
        return this.pixiElement.pivot
    }
    set pivot(value: { x: number, y: number }) {
        this.pixiElement.pivot = value
    }
    get scale() {
        return this.pixiElement.scale
    }
    set scale(value: ObservablePoint) {
        this.pixiElement.scale = value
    }
}
