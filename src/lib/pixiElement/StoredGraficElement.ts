import { DisplayObject } from "pixi.js"

/**
 * This class is responsible for storing a PIXI DisplayObject.
 * And allow to save your memory in a game save.
 */
export abstract class DisplayObjectStored<T extends DisplayObject, T2> {
    pixiElement: T
    constructor(element: T) {
        this.pixiElement = element
    }
    abstract get memory(): T2
}
