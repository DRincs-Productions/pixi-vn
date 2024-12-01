import { ContainerOptions, Container as PixiContainer } from "pixi.js";
import { exportCanvasElement, importCanvasElement } from "../../functions/canvas/canvas-memory-utility";
import { ContainerMemory } from "../../interface";
import CanvasBaseItem from "./CanvasBaseItem";

export const CANVAS_CONTAINER_ID = "Container"
export type ContainerChild = PixiContainer & CanvasBaseItem<any>

/**
 * This class is a extension of the [PIXI.Container class](https://pixijs.com/8.x/examples/basic/container), it has the same properties and methods, 
 * but it has the ability to be saved and loaded by the Pixi'VN library.
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
export default class Container<C extends ContainerChild = ContainerChild> extends PixiContainer<C> implements CanvasBaseItem<ContainerMemory> {
    constructor(options?: ContainerOptions<C>) {
        super(options)
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_CONTAINER_ID
    }
    pixivnId: string = CANVAS_CONTAINER_ID
    get memory(): ContainerMemory {
        let memory = getMemoryContainer(this)
        this.children.forEach(child => {
            memory.elements.push(exportCanvasElement(child as CanvasBaseItem<any>))
        })
        return memory
    }
    set memory(value: ContainerMemory) {
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

export function setMemoryContainer<T extends PixiContainer>(element: T | PixiContainer, memory: ContainerOptions | {}) {
    "isRenderGroup" in memory && memory.isRenderGroup && (element.isRenderGroup = memory.isRenderGroup)
    "blendMode" in memory && memory.blendMode && (element.blendMode = memory.blendMode)
    "tint" in memory && memory.tint && (element.tint = memory.tint)
    "alpha" in memory && memory.alpha && (element.alpha = memory.alpha)
    "angle" in memory && memory.angle && (element.angle = memory.angle)
    "renderable" in memory && memory.renderable && (element.renderable = memory.renderable)
    "rotation" in memory && memory.rotation && (element.rotation = memory.rotation)
    if ("scale" in memory && memory.scale) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale)
        }
        else {
            element.scale.set(memory.scale.x, memory.scale.y)
        }
    }
    if ("pivot" in memory && memory.pivot) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot)
        }
        else {
            element.pivot.set(memory.pivot.x, memory.pivot.y)
        }
    }
    "position" in memory && memory.position && (element.position.set(memory.position.x, memory.position.y))
    "skew" in memory && memory.skew && (element.skew.set(memory.skew.x, memory.skew.y))
    "visible" in memory && memory.visible && (element.visible = memory.visible)
    "x" in memory && memory.x && (element.x = memory.x)
    "y" in memory && memory.y && (element.y = memory.y)
    "boundsArea" in memory && memory.boundsArea && (element.boundsArea = memory.boundsArea)

    "cursor" in memory && memory.cursor && (element.cursor = memory.cursor)
    "eventMode" in memory && memory.eventMode && (element.eventMode = memory.eventMode)
    "interactive" in memory && memory.interactive && (element.interactive = memory.interactive)
    "interactiveChildren" in memory && memory.interactiveChildren && (element.interactiveChildren = memory.interactiveChildren)
    "hitArea" in memory && memory.hitArea && (element.hitArea = memory.hitArea)

    // end
    // width and height must be set after the scale
    "width" in memory && memory.width && (element.width = memory.width)
    "height" in memory && memory.height && (element.height = memory.height)
}
