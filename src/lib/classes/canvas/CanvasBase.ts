import { DisplayObject, ObservablePoint } from "pixi.js"
import { ICanvasBaseMemory } from "../../interface/canvas/ICanvasBaseMemory"
import { GameWindowManager } from "../../managers/WindowManager"

/**
 * This class is responsible for storing a PIXI DisplayObject.
 * And allow to save your memory in a game save.
 */
export abstract class CanvasBase<T extends DisplayObject, T2 extends ICanvasBaseMemory> {
    get pixiElement() {
        return this._pixiElement
    }
    set pixiElement(value: T) {
        if (GameWindowManager.childIsOnCanvas(this._pixiElement)) {
            GameWindowManager.removeChildTemporary(this._pixiElement)
            GameWindowManager.addChildTemporary(value)
        }
        this._pixiElement = value
    }
    private _pixiElement: T
    constructor(element: T) {
        this._pixiElement = element
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
    get alpha() {
        return this.pixiElement.alpha
    }
    set alpha(value: number) {
        this.pixiElement.alpha = value
    }
}
