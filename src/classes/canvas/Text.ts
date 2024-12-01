import { ContainerChild, ContainerEvents, EventEmitter, Text as PixiText, TextOptions } from "pixi.js";
import { getEventInstanceById, getEventTypeById } from "../../decorators/event-decorator";
import { getTextStyle } from "../../functions/texture-utility";
import { TextMemory } from "../../interface";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasEvent from "../CanvasEvent";
import CanvasBaseItem from "./CanvasBaseItem";
import { getMemoryContainer, setMemoryContainer } from "./Container";

export const CANVAS_TEXT_ID = "Text"

/**
 * This class is a extension of the [PIXI.Text class](https://pixijs.com/8.x/examples/text/pixi-text), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi'VN library.
 * @example
 * ```typescript
 * const text = new Text();
 * text.text = "Hello World"
 * canvas.add("text", text);
 * ```
 */
export default class Text extends PixiText implements CanvasBaseItem<TextMemory> {
    constructor(options?: TextOptions) {
        super(options)
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_TEXT_ID
    }
    pixivnId: string = CANVAS_TEXT_ID
    get memory(): TextMemory {
        return getMemoryText(this)
    }
    set memory(value: TextMemory) {
        setMemoryText(this, value)
    }
    private _onEvents: { [name: CanvasEventNamesType]: EventIdType } = {}
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
     * export class EventTest extends CanvasEvent<Text> {
     *     override fn(event: CanvasEventNamesType, text: Text): void {
     *         if (event === 'pointerdown') {
     *             text.scale.x *= 1.25;
     *             text.scale.y *= 1.25;
     *         }
     *     }
     * }
     * ```
     * 
     * ```typescript
     * const text = new Text();
     * text.text = "Hello World"
     *
     * text.eventMode = 'static';
     * text.cursor = 'pointer';
     * text.onEvent('pointerdown', EventTest);
     *
     * canvas.add("text", text);
     * ```
     */
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let id = eventClass.prototype.id
        let instance = getEventInstanceById(id)
        this._onEvents[event] = id
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<CanvasBaseItem<any>>).fn(event, this)
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
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any;[K: {} & string]: any; }>(event: T, fn: (...args: EventEmitter.ArgumentMap<ContainerEvents<ContainerChild> & { [K: symbol]: any;[K: {} & string]: any; }>[Extract<T, keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any;[K: {} & string]: any; }>]) => void, context?: any): this {
        return super.on(event, fn, context)
    }
}

export function getMemoryText<T extends Text>(element: T | Text): TextMemory {
    let temp = getMemoryContainer(element)
    return {
        ...temp,
        pixivnId: element.pixivnId,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        text: element.text,
        resolution: element.resolution,
        style: getTextStyle(element.style),
        roundPixels: element.roundPixels,
        onEvents: element.onEvents,
    }
}

export function setMemoryText(element: Text, memory: TextMemory | {}) {
    setMemoryContainer(element, memory)
    if ("anchor" in memory && memory.anchor) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor)
        }
        else {
            element.anchor.set(memory.anchor.x, memory.anchor.y)
        }
    }
    "text" in memory && memory.text && (element.text = memory.text)
    "resolution" in memory && memory.resolution && (element.resolution = memory.resolution)
    "style" in memory && memory.style && (element.style = memory.style)
    "roundPixels" in memory && memory.roundPixels && (element.roundPixels = memory.roundPixels)
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event]
            let instance = getEventTypeById(id)
            if (instance) {
                element.onEvent(event as CanvasEventNamesType, instance)
            }
        }
    }
}
