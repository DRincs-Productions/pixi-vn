import type CanvasBaseItem from "@canvas/classes/CanvasBaseItem";
import type AdditionalPositionsExtension from "@canvas/components/AdditionalPositionsExtension";
import { analizePositionsExtensionProps } from "@canvas/components/AdditionalPositionsExtension";
import type AnchorExtension from "@canvas/components/AnchorExtension";
import type ListenerExtension from "@canvas/components/ListenerExtension";
import { addListenerHandler, type OnEventsHandlers } from "@canvas/components/ListenerExtension";
import {
    default as RegisteredCanvasComponents,
    setMemoryContainer,
} from "@canvas/decorators/canvas-element-decorator";
import { importCanvasElement } from "@canvas/functions/canvas-import-utility";
import { getMemoryContainer } from "@canvas/functions/canvas-memory-utility";
import { CanvasPropertyUtility as PropsUtils } from "@canvas/functions/canvas-property-utility";
import type { ContainerOptions } from "@canvas/interfaces/canvas-options";
import type ContainerMemory from "@canvas/interfaces/memory/ContainerMemory";
import type ContainerChild from "@canvas/types/ContainerChild";
import { CANVAS_CONTAINER_ID } from "@constants";
import type { ObservablePoint, PointData } from "@drincs/pixi-vn/pixi.js";
import {
    type ContainerEvents,
    type EventEmitter,
    Container as PixiContainer,
} from "@drincs/pixi-vn/pixi.js";

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
export default class Container<
        C extends ContainerChild = ContainerChild,
        Memory extends ContainerMemory = ContainerMemory,
    >
    extends PixiContainer<C>
    implements
        CanvasBaseItem<Memory>,
        ListenerExtension,
        AnchorExtension,
        AdditionalPositionsExtension
{
    constructor(options?: ContainerOptions<C>) {
        const { anchor, align, percentagePosition, ...restOptions } =
            analizePositionsExtensionProps(options) || {};
        super(restOptions);
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_CONTAINER_ID;
        if (anchor) {
            this.anchor = anchor;
        }
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    readonly pixivnId: string = CANVAS_CONTAINER_ID;
    get memory(): Memory {
        return {
            ...(getMemoryContainer(this, { childrenExport: true }) as Memory),
            anchor: this._anchor ? this.anchor : undefined,
            align: this._align,
            percentagePosition: this._percentagePosition,
        };
    }
    async setMemory(value: Memory): Promise<void> {
        await this.importChildren(value);
        await setMemoryContainer(this, value);
        this.reloadAnchor();
        this.reloadPosition();
    }
    protected async importChildren(value: Memory) {
        for (let i = 0; i < value.elements.length; i++) {
            const child = value.elements[i];
            const element = await importCanvasElement<any, C>(child);
            this.addChild(element);
        }
    }

    /** ListenerExtension */

    readonly onEventsHandlers: OnEventsHandlers = {};
    override on<
        T extends keyof ContainerEvents<C> | keyof { [K: symbol]: any; [K: {} & string]: any },
    >(
        event: T,
        fn: (
            ...args: [
                ...EventEmitter.ArgumentMap<
                    ContainerEvents<C> & { [K: symbol]: any; [K: {} & string]: any }
                >[Extract<
                    T,
                    keyof ContainerEvents<C> | keyof { [K: symbol]: any; [K: {} & string]: any }
                >],
                typeof this,
            ]
        ) => void,
        context?: any,
    ): this {
        addListenerHandler(event, this, fn);

        return super.on<T>(event, (...e) => fn(...e, this), context);
    }

    /** Anchor */

    private _anchor?: PointData;
    get anchor(): PointData {
        const x = super.pivot.x / this.width;
        const y = super.pivot.y / this.height;
        return { x, y };
    }
    set anchor(value: PointData | number) {
        if (typeof value === "number") {
            this._anchor = { x: value, y: value };
        } else {
            this._anchor = value;
        }
        this.reloadAnchor();
    }
    protected reloadAnchor() {
        if (this._anchor) {
            super.pivot.set(this._anchor.x * this.width, this._anchor.y * this.height);
        }
    }
    override get pivot() {
        return super.pivot;
    }
    override set pivot(value: ObservablePoint) {
        this._anchor = undefined;
        super.pivot = value;
    }

    /** AdditionalPositions */

    private _align: Partial<PointData> | undefined = undefined;
    set align(value: Partial<PointData> | number) {
        this._percentagePosition = undefined;
        if (this._align === undefined) this._align = {};
        if (typeof value === "number") {
            this._align.x = value;
            this._align.y = value;
        } else {
            if (value.x !== undefined) this._align.x = value.x;
            if (value.y !== undefined) this._align.y = value.y;
        }
        this.reloadPosition();
    }
    get align() {
        const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return {
            x: PropsUtils.calculateAlignByPosition(
                "width",
                this.x,
                PropsUtils.getSuperWidth(this),
                superPivot.x,
                superScale.x < 0,
            ),
            y: PropsUtils.calculateAlignByPosition(
                "height",
                this.y,
                PropsUtils.getSuperHeight(this),
                superPivot.y,
                superScale.y < 0,
            ),
        };
    }
    set xAlign(value: number) {
        if (this._percentagePosition) {
            this._percentagePosition = undefined;
        }
        if (this._align === undefined) this._align = {};
        this._align.x = value;
        this.reloadPosition();
    }
    get xAlign() {
        const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return PropsUtils.calculateAlignByPosition(
            "width",
            this.x,
            PropsUtils.getSuperWidth(this),
            superPivot.x,
            superScale.x < 0,
        );
    }
    set yAlign(value: number) {
        if (this._percentagePosition) {
            this._percentagePosition = undefined;
        }
        if (this._align === undefined) this._align = {};
        this._align.y = value;
        this.reloadPosition();
    }
    get yAlign() {
        const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return PropsUtils.calculateAlignByPosition(
            "height",
            this.y,
            PropsUtils.getSuperHeight(this),
            superPivot.y,
            superScale.y < 0,
        );
    }
    private _percentagePosition: Partial<PointData> | undefined = undefined;
    set percentagePosition(value: Partial<PointData> | number) {
        this._align = undefined;
        if (this._percentagePosition === undefined) this._percentagePosition = {};
        if (typeof value === "number") {
            this._percentagePosition.x = value;
            this._percentagePosition.y = value;
        } else {
            if (value.x !== undefined) this._percentagePosition.x = value.x;
            if (value.y !== undefined) this._percentagePosition.y = value.y;
        }
        this.reloadPosition();
    }
    get percentagePosition() {
        return {
            x: PropsUtils.calculatePercentagePositionByPosition("width", this.x),
            y: PropsUtils.calculatePercentagePositionByPosition("height", this.y),
        };
    }
    set percentageX(_value: number) {
        if (this._align) {
            this._align = undefined;
        }
        if (this._percentagePosition === undefined) this._percentagePosition = {};
        this._percentagePosition.x = _value;
        this.reloadPosition();
    }
    get percentageX() {
        return PropsUtils.calculatePercentagePositionByPosition("width", this.x);
    }
    set percentageY(_value: number) {
        if (this._align) {
            this._align = undefined;
        }
        if (this._percentagePosition === undefined) this._percentagePosition = {};
        this._percentagePosition.y = _value;
        this.reloadPosition();
    }
    get percentageY() {
        return PropsUtils.calculatePercentagePositionByPosition("height", this.y);
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
        switch (this.positionType) {
            case "align":
                return { x: this.xAlign, y: this.yAlign, type: "align" };
            case "percentage":
                return { x: this.percentageX, y: this.percentageY, type: "percentage" };
            default:
                return { x: this.x, y: this.y, type: "pixel" };
        }
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
    protected reloadPosition() {
        if (this._align) {
            const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
            const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
            if (this._align.x !== undefined) {
                super.x = PropsUtils.calculatePositionByAlign(
                    "width",
                    this._align.x,
                    PropsUtils.getSuperWidth(this),
                    superPivot.x,
                    superScale.x < 0,
                );
            }
            if (this._align.y !== undefined) {
                super.y = PropsUtils.calculatePositionByAlign(
                    "height",
                    this._align.y,
                    PropsUtils.getSuperHeight(this),
                    superPivot.y,
                    superScale.y < 0,
                );
            }
        } else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = PropsUtils.calculatePositionByPercentagePosition(
                    "width",
                    this._percentagePosition.x,
                );
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = PropsUtils.calculatePositionByPercentagePosition(
                    "height",
                    this._percentagePosition.y,
                );
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
RegisteredCanvasComponents.add<ContainerMemory, typeof Container>(Container, {
    name: CANVAS_CONTAINER_ID,
    copyProperty: async (component, memory) => {
        return await setMemoryContainer(component as Container, memory);
    },
});
