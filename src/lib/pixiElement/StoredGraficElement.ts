import { DisplayObject } from "pixi.js"

export abstract class StoredGraficElement<T extends DisplayObject, T2> {
    pixiElement: T
    constructor(element: T) {
        this.pixiElement = element
    }
    abstract get memory(): T2
}
