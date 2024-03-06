import { ObservablePoint } from "pixi.js"
import { ICanvasBaseMemory } from "../../interface/canvas/ICanvasBaseMemory"
import { GameWindowManager } from "../../managers/WindowManager"

/**
 * This class is responsible for storing a PIXI DisplayObject.
 * And allow to save your memory in a game save.
 */
export abstract class CanvasBase<T extends DisplayObject, T2 extends ICanvasBaseMemory> {
    get view() {
        return this._view
    }
    set view(value: T) {
        if (GameWindowManager.canvasElementIsOnCanvas(this._view)) {
            GameWindowManager.removeCanvasElementTemporary(this._view)
            GameWindowManager.addCanvasElementTemporary(value)
        }
        this._view = value
    }
    private _view: T
    constructor(element: T) {
        this._view = element
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
        return this.view.x
    }
    set x(value: number) {
        this.view.x = value
    }
    get y() {
        return this.view.y
    }
    set y(value: number) {
        this.view.y = value
    }
    get rotation() {
        return this.view.rotation
    }
    set rotation(value: number) {
        this.view.rotation = value
    }
    get pivot() {
        return this.view.pivot
    }
    set pivot(value: { x: number, y: number }) {
        this.view.pivot = value
    }
    get scale() {
        return this.view.scale
    }
    set scale(value: ObservablePoint) {
        this.view.scale = value
    }
    get alpha() {
        return this.view.alpha
    }
    set alpha(value: number) {
        this.view.alpha = value
    }
}
