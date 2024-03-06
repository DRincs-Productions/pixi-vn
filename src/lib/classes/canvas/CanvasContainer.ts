import { Container } from "pixi.js";
import { ICanvasContainerMemory } from "../../interface/canvas/ICanvasContainerMemory";
import { CanvasBase } from "./CanvasBase";

/**
 * This class is responsible for storing a PIXI Container.
 * And allow to save your memory in a game save.
 */
export class CanvasContainer<T1 extends Container = Container, T2 extends ICanvasContainerMemory = ICanvasContainerMemory> extends CanvasBase<T1, T2> {
    listChildren: CanvasBase<any, any>[] = []
    constructor(container?: T1) {
        if (container) {
            super(container)
        }
        else {
            super(new Container() as T1)
        }
    }
    get memory(): T2 {
        return this.memoryContainer as T2
    }
    set memory(value: T2) {
        this.memoryContainer = value
    }
    addChild<U extends CanvasBase<any, any>[]>(...children: U): U[0] {
        children.forEach(child => {
            this.view.addChild(child.view)
            this.listChildren.push(child)
        })
        return children[0]
    }
    get memoryContainer(): ICanvasContainerMemory {
        return {
            className: this.constructor.name,
            elements: [],
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            pivot: { x: this.pivot.x, y: this.pivot.y },
            scale: { x: this.scale.x, y: this.scale.y },
            width: this.width,
            height: this.height,
            alpha: this.alpha,
        }
    }
    set memoryContainer(value: ICanvasContainerMemory) {
        if (value.x !== undefined) this.x = value.x
        if (value.y !== undefined) this.y = value.y
        if (value.rotation !== undefined) this.rotation = value.rotation
        if (value.pivot !== undefined) this.pivot = value.pivot
        if (value.scale !== undefined) this.scale = value.scale
        if (value.width !== undefined) this.width = value.width
        if (value.height !== undefined) this.height = value.height
        if (value.alpha !== undefined) this.alpha = value.alpha
    }
    get width() {
        return this.view.width
    }
    set width(value: number) {
        this.view.width = value
    }
    get height() {
        return this.view.height
    }
    set height(value: number) {
        this.view.height = value
    }
}
