import type {
    ContainerChild,
    ContainerEvents,
    EventEmitter,
    ObservablePoint,
    PointData,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_TEXT_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import CanvasEvent from "../classes/CanvasEvent";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import { default as RegisteredEvents } from "../decorators/event-decorator";
import { getMemoryText } from "../functions/canvas-memory-utility";
import {
    calculateAlignByPosition,
    calculatePercentagePositionByPosition,
    calculatePositionByAlign,
    calculatePositionByPercentagePosition,
    getSuperHeight,
    getSuperPoint,
    getSuperWidth,
} from "../functions/canvas-property-utility";
import { TextOptions } from "../interfaces/canvas-options";
import TextMemory from "../interfaces/memory/TextMemory";
import CanvasEventNamesType from "../types/CanvasEventNamesType";
import { EventIdType } from "../types/EventIdType";
import AdditionalPositionsExtension, { analizePositionsExtensionProps } from "./AdditionalPositions";
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
export default class Text extends PIXI.Text implements CanvasBaseItem<TextMemory>, AdditionalPositionsExtension {
    constructor(options?: TextOptions) {
        options = analizePositionsExtensionProps(options as any);
        let align = undefined;
        let percentagePosition = undefined;
        if (options && "align" in options && options?.align !== undefined) {
            align = options.align;
            delete options.align;
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            percentagePosition = options.percentagePosition;
            delete options.percentagePosition;
        }
        super(options);
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_TEXT_ID;
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    pixivnId: string = CANVAS_TEXT_ID;
    get memory(): TextMemory {
        return {
            ...getMemoryText(this),
            pixivnId: this.pixivnId,
            align: this._align,
            percentagePosition: this._percentagePosition,
        };
    }
    set memory(_value: TextMemory) {}
    async setMemory(value: TextMemory) {
        this.memory = value;
        await setMemoryText(this, value);
        this.reloadPosition();
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
        let instance = RegisteredEvents.getInstance(id);
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
     * Add a listener for a given event.
     * Unlike {@link onEvent}, this method does **not track the event association in the current game state**, so it will not be included in saves.
     */
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (
            ...args: EventEmitter.ArgumentMap<
                ContainerEvents<ContainerChild> & { [K: symbol]: any; [K: {} & string]: any }
            >[Extract<T, keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>]
        ) => void,
        context?: any,
    ): this {
        return super.on(event, fn, context);
    }

    /** AdditionalPositions */
    private _align: Partial<PointData> | undefined = undefined;
    set align(value: Partial<PointData> | number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        if (typeof value === "number") {
            this._align.x = value;
            this._align.y = value;
        } else {
            value.x !== undefined && (this._align.x = value.x);
            value.y !== undefined && (this._align.y = value.y);
        }
        this.reloadPosition();
    }
    get align() {
        let superPivot = getSuperPoint(this.pivot, this.angle);
        let superScale = getSuperPoint(this.scale, this.angle);
        return {
            x: calculateAlignByPosition(
                "width",
                this.x,
                getSuperWidth(this),
                superPivot.x,
                superScale.x < 0,
                this.anchor.x,
            ),
            y: calculateAlignByPosition(
                "height",
                this.y,
                getSuperHeight(this),
                superPivot.y,
                superScale.y < 0,
                this.anchor.y,
            ),
        };
    }
    set xAlign(value: number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        this._align.x = value;
        this.reloadPosition();
    }
    get xAlign() {
        let superPivot = getSuperPoint(this.pivot, this.angle);
        let superScale = getSuperPoint(this.scale, this.angle);
        return calculateAlignByPosition(
            "width",
            this.x,
            getSuperWidth(this),
            superPivot.x,
            superScale.x < 0,
            this.anchor.x,
        );
    }
    set yAlign(value: number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        this._align.y = value;
        this.reloadPosition();
    }
    get yAlign() {
        let superPivot = getSuperPoint(this.pivot, this.angle);
        let superScale = getSuperPoint(this.scale, this.angle);
        return calculateAlignByPosition(
            "height",
            this.y,
            getSuperHeight(this),
            superPivot.y,
            superScale.y < 0,
            this.anchor.y,
        );
    }
    private _percentagePosition: Partial<PointData> | undefined = undefined;
    set percentagePosition(value: Partial<PointData> | number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        if (typeof value === "number") {
            this._percentagePosition.x = value;
            this._percentagePosition.y = value;
        } else {
            value.x !== undefined && (this._percentagePosition.x = value.x);
            value.y !== undefined && (this._percentagePosition.y = value.y);
        }
        this.reloadPosition();
    }
    get percentagePosition() {
        return {
            x: calculatePercentagePositionByPosition("width", this.x),
            y: calculatePercentagePositionByPosition("height", this.y),
        };
    }
    get percentageX() {
        return calculatePercentagePositionByPosition("width", this.x);
    }
    set percentageX(_value: number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.x = _value;
        this.reloadPosition();
    }
    get percentageY() {
        return calculatePercentagePositionByPosition("height", this.y);
    }
    set percentageY(_value: number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.y = _value;
        this.reloadPosition();
    }
    get positionType(): "pixel" | "percentage" | "align" {
        if (this._align) {
            return "align";
        } else if (this._percentagePosition) {
            return "percentage";
        }
        return "pixel";
    }
    get positionInfo(): { x: number; y: number; type: "pixel" | "percentage" | "align" } {
        if (this._align) {
            return { x: this._align.x || 0, y: this._align.y || 0, type: "align" };
        } else if (this._percentagePosition) {
            return { x: this._percentagePosition.x || 0, y: this._percentagePosition.y || 0, type: "percentage" };
        }
        return { x: this.x, y: this.y, type: "pixel" };
    }
    set positionInfo(value: { x: number; y: number; type?: "pixel" | "percentage" | "align" }) {
        if (value.type === "align") {
            this.align = { x: value.x, y: value.y };
        } else if (value.type === "percentage") {
            this.percentagePosition = { x: value.x, y: value.y };
        } else {
            this.position.set(value.x, value.y);
        }
    }
    private reloadPosition() {
        if (this._align) {
            let superPivot = getSuperPoint(this.pivot, this.angle);
            let superScale = getSuperPoint(this.scale, this.angle);
            if (this._align.x !== undefined) {
                super.x = calculatePositionByAlign(
                    "width",
                    this._align.x,
                    getSuperWidth(this),
                    superPivot.x,
                    superScale.x < 0,
                    this.anchor.x,
                );
            }
            if (this._align.y !== undefined) {
                super.y = calculatePositionByAlign(
                    "height",
                    this._align.y,
                    getSuperHeight(this),
                    superPivot.y,
                    superScale.y < 0,
                    this.anchor.y,
                );
            }
        } else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = calculatePositionByPercentagePosition("width", this._percentagePosition.x);
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = calculatePositionByPercentagePosition("height", this._percentagePosition.y);
            }
        }
    }
    get position(): ObservablePoint {
        return super.position;
    }
    set position(value: ObservablePoint) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.position = value;
    }
    get x(): number {
        return super.x;
    }
    set x(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.x = value;
    }
    override get y(): number {
        return super.y;
    }
    override set y(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.y = value;
    }
}
RegisteredCanvasComponents.add(Text, CANVAS_TEXT_ID);

export async function setMemoryText(element: Text, memory: TextMemory | {}) {
    "text" in memory && memory.text !== undefined && (element.text = memory.text);
    await setMemoryContainer(element, memory, {
        end: () => {
            "style" in memory && memory.style !== undefined && (element.style = memory.style);
        },
    });
    if ("anchor" in memory && memory.anchor !== undefined) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor);
        } else {
            element.anchor.set(memory.anchor.x, memory.anchor.y);
        }
    }
    "resolution" in memory && memory.resolution !== undefined && (element.resolution = memory.resolution);
    if ("anchor" in memory && memory.anchor !== undefined) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor);
        } else {
            element.anchor.set(memory.anchor.x, memory.anchor.y);
        }
    }
    "align" in memory && memory.align !== undefined && (element.align = memory.align);
    "percentagePosition" in memory &&
        memory.percentagePosition !== undefined &&
        (element.percentagePosition = memory.percentagePosition);
    "roundPixels" in memory && memory.roundPixels !== undefined && (element.roundPixels = memory.roundPixels);
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event];
            let instance = RegisteredEvents.get(id);
            if (instance) {
                element.onEvent(event as CanvasEventNamesType, instance);
            }
        }
    }
}
