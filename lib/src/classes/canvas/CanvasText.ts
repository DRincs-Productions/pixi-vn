import { Container, ContainerEvents, EventEmitter, Text } from "pixi.js";
import { canvasElementDecorator } from "../../decorators";
import { getEventInstanceByClassName, getEventTypeByClassName } from "../../decorators/EventDecorator";
import ICanvasBase from "../../interface/ICanvasBase";
import ICanvasTextMemory from "../../interface/canvas/ICanvasTextTextMemory";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import CanvasEvent from "../CanvasEvent";
import { getMemoryContainer, setMemoryContainer } from "./CanvasContainer";

/**
 * This class is responsible for storing a PIXI Text.
 * And allow to save your memory in a game save.
 */
@canvasElementDecorator()
export default class CanvasText extends Text implements ICanvasBase<ICanvasTextMemory> {
    get memory(): ICanvasTextMemory {
        return getMemoryText(this)
    }
    set memory(value: ICanvasTextMemory) {
        setMemoryText(this, value)
    }
    private _onEvents: { [name: CanvasEventNamesType]: EventTagType } = {}
    get onEvents() {
        return this._onEvents
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
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = getEventInstanceByClassName(className)
        this._onEvents[event] = className
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<ICanvasBase<any>>).fn(event, this)
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

export function setMemoryText(element: CanvasText, memory: ICanvasTextMemory) {
    setMemoryContainer(element, memory)
    if (memory.anchor) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor)
        }
        else {
            element.anchor.set(memory.anchor.x, memory.anchor.y)
        }
    }
    memory.text && (element.text = memory.text)
    memory.resolution && (element.resolution = memory.resolution)
    memory.style && (element.style = memory.style)
    memory.roundPixels && (element.roundPixels = memory.roundPixels)
    for (let event in memory.onEvents) {
        let className = memory.onEvents[event]
        let instance = getEventTypeByClassName(className)
        if (instance) {
            element.onEvent(event as CanvasEventNamesType, instance)
        }
    }
}
