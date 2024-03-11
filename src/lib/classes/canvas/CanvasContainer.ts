import { Container } from "pixi.js";
import { ICanvasBase } from "../../interface/ICanvasBase";
import { ICanvasContainerMemory } from "../../interface/canvas/ICanvasContainerMemory";
import { SupportedCanvasElement } from "../../types/SupportedCanvasElement";

/**
 * This class is responsible for storing a PIXI Container.
 * And allow to save your memory in a game save.
 */
export class CanvasContainer extends Container implements ICanvasBase<ICanvasContainerMemory> {
    get memory(): ICanvasContainerMemory {
        return getMemoryContainer(this)
    }
    addCanvasChild<U extends SupportedCanvasElement[]>(...children: U): U[0] {
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
    }
}
