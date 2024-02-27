import { Container } from "pixi.js";
import { StoredGraficElement } from "./StoredGraficElement";

export interface IContainerMemory extends IContainer {
}
export interface IContainer {
    x: number,
    y: number,
    rotation: number,
    pivot: { x: number, y: number },
}

export abstract class ContainerSTInternal<T1 extends Container, T2 extends IContainer> extends StoredGraficElement<T1, T2> {
    abstract get memory(): T2
    private listChildren: StoredGraficElement<any, any>[] = []
    constructor(container: T1) {
        super(container)
    }

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
    addChild<U extends StoredGraficElement<any, any>[]>(...children: U): U[0] {
        children.forEach(child => {
            this.pixiElement.addChild(child.pixiElement)
            this.listChildren.push(child)
        })
        return children[0]
    }
}

export class ContainerST extends ContainerSTInternal<Container, IContainerMemory> {
    get memory(): IContainerMemory {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(new Container())
    }
}