import { Container, ContainerOptions } from "pixi.js";
import { canvasElementDecorator } from "../../decorators";
import { exportCanvasElement, importCanvasElement } from "../../functions/CanvasUtility";
import ICanvasBase from "../../interface/ICanvasBase";
import ICanvasContainerMemory from "../../interface/canvas/ICanvasContainerMemory";

/**
 * This class is responsible for storing a PIXI Container.
 * And allow to save your memory in a game save.
 */
@canvasElementDecorator()
export default class CanvasContainer extends Container implements ICanvasBase<ICanvasContainerMemory> {
    get memory(): ICanvasContainerMemory {
        let memory = getMemoryContainer(this)
        this.children.forEach(child => {
            memory.elements.push(exportCanvasElement(child as ICanvasBase<any>))
        })
        return memory
    }
    set memory(value: ICanvasContainerMemory) {
        setMemoryContainer(this, value)
        value.elements.forEach(child => {
            this.addCanvasChild(importCanvasElement(child))
        })
    }
    addCanvasChild<U extends ICanvasBase<any>[]>(...children: U): U[0] {
        return super.addChild(...children)
    }
    /**
     * addChild() does not keep in memory the children, use addCanvasChild() instead
     * @deprecated
     * @param children 
     * @returns 
     */
    override addChild<U extends Container[]>(...children: U): U[0] {
        console.warn("addChild() does not keep in memory the children, use addCanvasChild() instead")
        return super.addChild(...children)
    }
}

export function getMemoryContainer<T extends Container>(element: T): ICanvasContainerMemory {
    return {
        className: "CanvasContainer",
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
        culled: element.culled,
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

export function setMemoryContainer<T extends Container>(element: T | Container, memory: ContainerOptions) {
    memory.width && (element.width = memory.width)
    memory.height && (element.height = memory.height)

    memory.isRenderGroup && (element.isRenderGroup = memory.isRenderGroup)
    memory.blendMode && (element.blendMode = memory.blendMode)
    memory.tint && (element.tint = memory.tint)
    memory.alpha && (element.alpha = memory.alpha)
    memory.angle && (element.angle = memory.angle)
    memory.renderable && (element.renderable = memory.renderable)
    memory.rotation && (element.rotation = memory.rotation)
    if (memory.scale) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale)
        }
        else {
            element.scale.set(memory.scale.x, memory.scale.y)
        }
    }
    if (memory.pivot) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot)
        }
        else {
            element.pivot.set(memory.pivot.x, memory.pivot.y)
        }
    }
    memory.position && (element.position.set(memory.position.x, memory.position.y))
    memory.skew && (element.skew.set(memory.skew.x, memory.skew.y))
    memory.visible && (element.visible = memory.visible)
    memory.culled && (element.culled = memory.culled)
    memory.x && (element.x = memory.x)
    memory.y && (element.y = memory.y)
    memory.boundsArea && (element.boundsArea = memory.boundsArea)

    memory.cursor && (element.cursor = memory.cursor)
    memory.eventMode && (element.eventMode = memory.eventMode)
    memory.interactive && (element.interactive = memory.interactive)
    memory.interactiveChildren && (element.interactiveChildren = memory.interactiveChildren)
    memory.hitArea && (element.hitArea = memory.hitArea)
}
