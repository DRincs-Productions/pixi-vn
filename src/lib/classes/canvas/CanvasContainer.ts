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
        if (value.width !== undefined) this.width = value.width
        if (value.height !== undefined) this.height = value.height
        // children ?: Container[];
        // parent ?: Container;

        if (value.isRenderGroup !== undefined) this.view.isRenderGroup = value.isRenderGroup
        if (value.blendMode !== undefined) this.view.blendMode = value.blendMode
        if (value.tint !== undefined) this.view.tint = value.tint
        if (value.alpha !== undefined) this.alpha = value.alpha
        if (value.angle !== undefined) this.view.angle = value.angle
        if (value.renderable !== undefined) this.view.renderable = value.renderable
        if (value.rotation !== undefined) this.rotation = value.rotation
        if (value.scale !== undefined) this.scale = value.scale
        if (value.pivot !== undefined) this.pivot = value.pivot
        if (value.position !== undefined) { this.view.position = value.position }
        if (value.skew !== undefined) { this.view.skew = value.skew }
        if (value.visible !== undefined) this.view.visible = value.visible
        if (value.culled !== undefined) this.view.culled = value.culled
        if (value.x !== undefined) this.x = value.x
        if (value.y !== undefined) this.y = value.y
        if (value.boundsArea !== undefined) this.view.boundsArea = value.boundsArea
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
