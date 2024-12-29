import { ContainerOptions, Container as PixiContainer } from "pixi.js";
import { CANVAS_CONTAINER_ID } from "../../constants";
import { importCanvasElement } from "../../functions/canvas/canvas-import-utility";
import { getMemoryContainer } from "../../functions/canvas/canvas-memory-utility";
import { ContainerMemory } from "../../interface";
import ContainerChild from "../../types/ContainerChild";
import CanvasBaseItem from "./CanvasBaseItem";

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
        return getMemoryContainer(this, { childrenExport: true }) as Memory
    }
    set memory(value: Memory) {
        this.setMemory(value)
    }
    async setMemory(value: Memory): Promise<void> {
        await this.importChildren(value)
        return await setMemoryContainer(this, value)
    }
    protected async importChildren(value: Memory) {
        for (let i = 0; i < value.elements.length; i++) {
            let child = value.elements[i]
            let element = await importCanvasElement<C>(child)
            this.addChild(element)
        }
    }
}

export async function setMemoryContainer<T extends PixiContainer>(element: T | PixiContainer, memory: ContainerOptions | {}, opstions?: {
    ignoreScale?: boolean,
    end?: () => Promise<void>
}) {
    let ignoreScale = opstions?.ignoreScale || false
    let end = opstions?.end
    "isRenderGroup" in memory && memory.isRenderGroup !== undefined && (element.isRenderGroup = memory.isRenderGroup)
    "blendMode" in memory && memory.blendMode !== undefined && (element.blendMode = memory.blendMode)
    "tint" in memory && memory.tint !== undefined && (element.tint = memory.tint)
    "alpha" in memory && memory.alpha !== undefined && (element.alpha = memory.alpha)
    "angle" in memory && memory.angle !== undefined && (element.angle = memory.angle)
    "renderable" in memory && memory.renderable !== undefined && (element.renderable = memory.renderable)
    "rotation" in memory && memory.rotation !== undefined && (element.rotation = memory.rotation)
    if (!ignoreScale && "scale" in memory && memory.scale !== undefined) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale)
        }
        else {
            element.scale.set(memory.scale.x, memory.scale.y)
        }
    }
    if ("pivot" in memory && memory.pivot !== undefined) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot)
        }
        else {
            element.pivot.set(memory.pivot.x, memory.pivot.y)
        }
    }
    "position" in memory && memory.position !== undefined && (element.position.set(memory.position.x, memory.position.y))
    "skew" in memory && memory.skew !== undefined && (element.skew.set(memory.skew.x, memory.skew.y))
    "visible" in memory && memory.visible !== undefined && (element.visible = memory.visible)
    "x" in memory && memory.x !== undefined && (element.x = memory.x)
    "y" in memory && memory.y !== undefined && (element.y = memory.y)
    "boundsArea" in memory && memory.boundsArea !== undefined && (element.boundsArea = memory.boundsArea)

    "cursor" in memory && memory.cursor !== undefined && (element.cursor = memory.cursor)
    "eventMode" in memory && memory.eventMode !== undefined && (element.eventMode = memory.eventMode)
    "interactive" in memory && memory.interactive !== undefined && (element.interactive = memory.interactive)
    "interactiveChildren" in memory && memory.interactiveChildren !== undefined && (element.interactiveChildren = memory.interactiveChildren)
    "hitArea" in memory && memory.hitArea !== undefined && (element.hitArea = memory.hitArea)

    // end
    if (end) {
        await end()
    }
    // width and height must be set after the scale
    if (!ignoreScale) {
        "width" in memory && memory.width !== undefined && (element.width = memory.width)
        "height" in memory && memory.height !== undefined && (element.height = memory.height)
    }
}
