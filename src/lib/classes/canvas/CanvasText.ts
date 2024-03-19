import { ContainerEvents, EventEmitter, Text } from "pixi.js";
import { canvasElementDecorator } from "../../decorators/CanvasElementDecorator";
import { getEventInstanceByClassName, getEventTypeByClassName } from "../../decorators/EventDecorator";
import { getTextStyle } from "../../functions/TextureUtility";
import { ICanvasTextMemory } from "../../interface/canvas/ICanvasTextTextMemory";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { CanvasEvent } from "../CanvasEvent";
import { CanvasBase } from "./CanvasBase";
import { getMemoryContainer, setMemoryContainer } from "./CanvasContainer";

/**
 * This class is a extension of the [PIXI.Text class](https://pixijs.com/8.x/examples/text/pixi-text), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi'VM library.
 * @example
 * ```typescript
 * const text = new CanvasText();
 * text.text = "Hello World"
 * GameWindowManager.addCanvasElement("text", text);
 * ```
 */
@canvasElementDecorator()
export class CanvasText extends Text implements CanvasBase<ICanvasTextMemory> {
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
    /**
     * is same function as on(), but it keeps in memory the children.
     * @param event The event type, e.g., 'click', 'mousedown', 'mouseup', 'pointerdown', etc.
     * @param eventClass The class that extends CanvasEvent.
     * @returns 
     * @example
     * ```typescript
     * \@eventDecorator()
     * export class EventTest extends CanvasEvent<CanvasText> {
     *     override fn(event: CanvasEventNamesType, text: CanvasText): void {
     *         if (event === 'pointerdown') {
     *             text.scale.x *= 1.25;
     *             text.scale.y *= 1.25;
     *         }
     *     }
     * }
     * ```
     * 
     * ```typescript
     * const text = new CanvasText();
     * text.text = "Hello World"
     *
     * text.eventMode = 'static';
     * text.cursor = 'pointer';
     * text.onEvent('pointerdown', EventTest);
     *
     * GameWindowManager.addCanvasElement("text", text);
     * ```
     */
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = getEventInstanceByClassName(className)
        this._onEvents[event] = className
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<CanvasBase<any>>).fn(event, this)
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
        style: getTextStyle(element.style),
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
