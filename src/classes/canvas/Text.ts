import { ContainerChild, ContainerEvents, EventEmitter, Text as PixiText, TextOptions } from "pixi.js";
import { canvasComponentDecorator } from "../..";
import { CANVAS_TEXT_ID } from "../../constants";
import { getEventInstanceById, getEventTypeById } from "../../decorators/event-decorator";
import { getMemoryText } from "../../functions/canvas/canvas-memory-utility";
import { logger } from "../../functions/log-utility";
import { TextMemory } from "../../interface";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasEvent from "../CanvasEvent";
import CanvasBaseItem from "./CanvasBaseItem";
import { setMemoryContainer } from "./Container";

/**
 * This class is a extension of the [PIXI.Text class](https://pixijs.com/8.x/examples/text/pixi-text), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi’VN library.
 * @example
 * ```typescript
 * const text = new Text();
 * text.text = "Hello World"
 * canvas.add("text", text);
 * ```
 */
canvasComponentDecorator(CANVAS_TEXT_ID);
export default class Text extends PixiText implements CanvasBaseItem<TextMemory> {
    constructor(options?: TextOptions) {
        super(options);
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_TEXT_ID;
    }
    pixivnId: string = CANVAS_TEXT_ID;
    get memory(): TextMemory {
        return getMemoryText(this);
    }
    set memory(_value: TextMemory) {}
    async setMemory(value: TextMemory) {
        this.memory = value;
        return await setMemoryText(this, value);
    }
    private _onEvents: { [name: string]: EventIdType } = {};
    get onEvents() {
        return this._onEvents;
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
    onEvent<T extends typeof CanvasEvent<typeof this>>(event: CanvasEventNamesType, eventClass: T) {
        let id = eventClass.prototype.id;
        let instance = getEventInstanceById(id);
        this._onEvents[event] = id;
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<CanvasBaseItem<any>>).fn(event, this);
            });
            if (!this.interactive) {
                this.interactive = true;
                this.eventMode = "dynamic";
            }
        } else {
            logger.error(`Event ${id} not found`);
        }
        return this;
    }
    /**
     * on() does not keep in memory the event class, use onEvent() instead
     * @deprecated
     * @private
     * @param event
     * @param fn
     * @param context
     */
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (
            ...args: EventEmitter.ArgumentMap<
                ContainerEvents<ContainerChild> & { [K: symbol]: any; [K: {} & string]: any }
            >[Extract<T, keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>]
        ) => void,
        context?: any
    ): this {
        return super.on(event, fn, context);
    }
}

export async function setMemoryText(element: Text, memory: TextMemory | {}) {
    await setMemoryContainer(element, memory);
    if ("anchor" in memory && memory.anchor !== undefined) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor);
        } else {
            element.anchor.set(memory.anchor.x, memory.anchor.y);
        }
    }
    "text" in memory && memory.text !== undefined && (element.text = memory.text);
    "resolution" in memory && memory.resolution !== undefined && (element.resolution = memory.resolution);
    "style" in memory && memory.style !== undefined && (element.style = memory.style);
    "roundPixels" in memory && memory.roundPixels !== undefined && (element.roundPixels = memory.roundPixels);
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event];
            let instance = getEventTypeById(id);
            if (instance) {
                element.onEvent(event as CanvasEventNamesType, instance);
            }
        }
    }
}
