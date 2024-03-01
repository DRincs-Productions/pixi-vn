import { Container } from "pixi.js";
import { ICanvasContainerMemory } from "../../interface/canvas/ICanvasContainerMemory";
import { CanvasBase } from "./CanvasBase";

export abstract class CanvasContainerBase<T1 extends Container, T2 extends ICanvasContainerMemory> extends CanvasBase<T1, T2> {
    listChildren: CanvasBase<any, any>[] = []
    constructor(container: T1) {
        super(container)
    }

    addChild<U extends CanvasBase<any, any>[]>(...children: U): U[0] {
        children.forEach(child => {
            this.pixiElement.addChild(child.pixiElement)
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
        }
    }
    set memoryContainer(value: ICanvasContainerMemory) {
        this.x = value.x
        this.y = value.y
        this.rotation = value.rotation
        this.pivot = value.pivot
        this.scale.set(value.scale.x, value.scale.y)
    }
}

/**
 * This class is responsible for storing a PIXI Container.
 * And allow to save your memory in a game save.
 */
export class CanvasContainer extends CanvasContainerBase<Container, ICanvasContainerMemory> {
    constructor() {
        super(new Container())
    }
    get memory(): ICanvasContainerMemory {
        return super.memoryContainer
    }
    set memory(value: ICanvasContainerMemory) {
        super.memoryContainer = value
    }
}