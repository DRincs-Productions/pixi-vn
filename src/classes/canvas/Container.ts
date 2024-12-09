import { ContainerOptions, Container as PixiContainer } from "pixi.js";
import { CANVAS_CONTAINER_ID } from "../../constants";
import { exportCanvasElement, importCanvasElement, setMemoryContainer } from "../../functions/canvas/canvas-memory-utility";
import { ContainerMemory } from "../../interface";
import CanvasBaseItem from "./CanvasBaseItem";
import ContainerChild from "./ContainerChild";

/**
 * This class is a extension of the [PIXI.Container class](https://pixijs.com/8.x/examples/basic/container), it has the same properties and methods, 
 * but it has the ability to be saved and loaded by the Pixi’VN library.
 * @example
 * ```typescript
 *  const container = new Container();
 *  canvas.add(container);
 *  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
 *  for (let i = 0; i < 25; i++)
 *  {
 *      const bunny = new Sprite(texture);
 *      bunny.x = (i % 5) * 40;
 *      bunny.y = Math.floor(i / 5) * 40;
 *      container.addChild(bunny);
 *  }
 * ```
 */
export default class Container<C extends ContainerChild = ContainerChild, Memory extends ContainerMemory = ContainerMemory> extends PixiContainer<C> implements CanvasBaseItem<Memory> {
    constructor(options?: ContainerOptions<C>) {
        super(options)
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_CONTAINER_ID
    }
    pixivnId: string = CANVAS_CONTAINER_ID
    get memory(): Memory {
        let memory = getMemoryContainer(this)
        this.children
            .sort((a, b) => this.getChildIndex(a) - this.getChildIndex(b))
            .forEach(child => {
                memory.elements.push(exportCanvasElement(child as CanvasBaseItem<any>))
            })
        return memory as Memory
    }
    set memory(value: Memory) {
        setMemoryContainer(this, value)
        value.elements.forEach(child => {
            this.addChild(importCanvasElement<C>(child))
        })
    }
}

export function getMemoryContainer<T extends PixiContainer>(element: T): ContainerMemory {
    let className = CANVAS_CONTAINER_ID
    if (element.hasOwnProperty("pixivnId")) {
        className = (element as any).pixivnId
    }
    return {
        pixivnId: className,
        elements: [],

        width: element.width,
        height: element.height,

        isRenderGroup: element.isRenderGroup,
        blendMode: element.blendMode,
        tint: element.tint,
        alpha: element.alpha,
        angle: element.angle,
        renderable: element.renderable,
        rotation: element.rotation,
        scale: { x: element.scale.x, y: element.scale.y },
        pivot: { x: element.pivot.x, y: element.pivot.y },
        position: { x: element.position.x, y: element.position.y },
        skew: { x: element.skew.x, y: element.skew.y },
        visible: element.visible,
        x: element.x,
        y: element.y,
        boundsArea: element.boundsArea,

        cursor: element.cursor,
        eventMode: element.eventMode,
        interactive: element.interactive,
        interactiveChildren: element.interactiveChildren,
        hitArea: element.hitArea
    }
}
