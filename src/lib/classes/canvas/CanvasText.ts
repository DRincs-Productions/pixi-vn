import { Container, ContainerEvents, EventEmitter, Text } from "pixi.js";
import { ICanvasTextMemory } from "../../interface/canvas/ICanvasTextTextMemory";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { SupportedCanvasElement } from "../../types/SupportedCanvasElement";
import { CanvasEvent } from "../CanvasEvent";
import { CanvasBase } from "./CanvasBase";
import { getMemoryContainer } from "./CanvasContainer";

/**
 * This class is responsible for storing a PIXI Text.
 * And allow to save your memory in a game save.
 */
export class CanvasText extends Text implements CanvasBase<ICanvasTextMemory> {
    get memory(): ICanvasTextMemory {
        return getMemoryText(this)
    }
    private _onEvents: { [name: CanvasEventNamesType]: EventTagType } = {}
    get onEvents() {
        return this._onEvents
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
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = GameWindowManager.getEventInstanceByClassName(className)
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<SupportedCanvasElement>).fn(event, this)
            })
        }
        return this
    }
    /**
     * on() does not keep in memory the event class, use onEvent() instead
     * @deprecated
     * @private
     * @param event 
     * @param fn 
     * @param context 
     */
    override on<T extends keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>(event: T, fn: (...args: EventEmitter.ArgumentMap<ContainerEvents & { [K: symbol]: any;[K: {} & string]: any; }>[Extract<T, keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>]) => void, context?: any): this {
        return super.on(event, fn, context)
    }
}

export function getMemoryText<T extends CanvasText>(element: T | CanvasText): ICanvasTextMemory {
    let temp = getMemoryContainer(element)
    return {
        ...temp,
        className: "CanvasText",
        anchor: { x: element.anchor.x, y: element.anchor.y },
        text: element.text,
        resolution: element.resolution,
        style: element.style,
        roundPixels: element.roundPixels,
        onEvents: element.onEvents,
    }
}
