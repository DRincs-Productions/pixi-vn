import { ContainerEvents, ContainerOptions, EventEmitter, Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_CONTAINER_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import CanvasEvent from "../classes/CanvasEvent";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import RegisteredEvents from "../decorators/event-decorator";
import { importCanvasElement } from "../functions/canvas-import-utility";
import { getMemoryContainer } from "../functions/canvas-memory-utility";
import ContainerMemory from "../interfaces/memory/ContainerMemory";
import CanvasEventNamesType from "../types/CanvasEventNamesType";
import ContainerChild from "../types/ContainerChild";
import { EventIdType } from "../types/EventIdType";

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
    implements CanvasBaseItem<Memory>
{
    constructor(options?: ContainerOptions<C>) {
        super(options);
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_CONTAINER_ID;
    }
    readonly pixivnId: string = CANVAS_CONTAINER_ID;
    get memory(): Memory {
        return getMemoryContainer(this, { childrenExport: true }) as Memory;
    }
    set memory(_value: Memory) {}
    async importChildren(value: Memory) {
        for (let i = 0; i < value.elements.length; i++) {
            let child = value.elements[i];
            let element = await importCanvasElement<any, C>(child);
            this.addChild(element);
        }
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
     * export class EventTest extends CanvasEvent<Container> {
     *     override fn(event: CanvasEventNamesType, container: Container): void {
     *         if (event === 'pointerdown') {
     *             container.scale.x *= 1.25;
     *             container.scale.y *= 1.25;
     *         }
     *     }
     * }
     * ```
     *
     * ```typescript
     * const container = new Container();
     *
     * container.eventMode = 'static';
     * container.cursor = 'pointer';
     * container.onEvent('pointerdown', EventTest);
     *
     * canvas.add("container", container);
     * ```
     */
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let id = eventClass.prototype.id;
        let instance = RegisteredEvents.getInstance(id);
        this._onEvents[event] = id;
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<CanvasBaseItem<any>>).fn(event, this);
            });
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
}
RegisteredCanvasComponents.add<ContainerMemory, typeof Container>(Container, {
    name: CANVAS_CONTAINER_ID,
    getInstance: async (type, memory) => {
        const instance = new type();
        instance.memory = memory;
        await instance.importChildren(memory);
        await setMemoryContainer(instance, memory);
        return instance;
    },
});

export async function setMemoryContainer<T extends PixiContainer>(
    element: T | PixiContainer,
    memory: ContainerOptions | {},
    options?: {
        ignoreScale?: boolean;
        end?: () => Promise<void> | void;
    },
) {
    let ignoreScale = options?.ignoreScale || false;
    let end = options?.end;
    "isRenderGroup" in memory && memory.isRenderGroup !== undefined && (element.isRenderGroup = memory.isRenderGroup);
    "blendMode" in memory && memory.blendMode !== undefined && (element.blendMode = memory.blendMode);
    "tint" in memory && memory.tint !== undefined && (element.tint = memory.tint);
    "alpha" in memory && memory.alpha !== undefined && (element.alpha = memory.alpha);
    "angle" in memory && memory.angle !== undefined && (element.angle = memory.angle);
    "renderable" in memory && memory.renderable !== undefined && (element.renderable = memory.renderable);
    "rotation" in memory && memory.rotation !== undefined && (element.rotation = memory.rotation);
    if (!ignoreScale && "scale" in memory && memory.scale !== undefined) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale);
        } else {
            element.scale.set(memory.scale.x, memory.scale.y);
        }
    }
    if ("pivot" in memory && memory.pivot !== undefined) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot);
        } else {
            element.pivot.set(memory.pivot.x, memory.pivot.y);
        }
    }
    "position" in memory && memory.position !== undefined && element.position.set(memory.position.x, memory.position.y);
    "skew" in memory && memory.skew !== undefined && element.skew.set(memory.skew.x, memory.skew.y);
    "visible" in memory && memory.visible !== undefined && (element.visible = memory.visible);
    "x" in memory && memory.x !== undefined && (element.x = memory.x);
    "y" in memory && memory.y !== undefined && (element.y = memory.y);
    "boundsArea" in memory && memory.boundsArea !== undefined && (element.boundsArea = memory.boundsArea);

    "cursor" in memory && memory.cursor !== undefined && (element.cursor = memory.cursor);
    "eventMode" in memory && memory.eventMode !== undefined && (element.eventMode = memory.eventMode);
    "interactive" in memory && memory.interactive !== undefined && (element.interactive = memory.interactive);
    "interactiveChildren" in memory &&
        memory.interactiveChildren !== undefined &&
        (element.interactiveChildren = memory.interactiveChildren);
    "hitArea" in memory && memory.hitArea !== undefined && (element.hitArea = memory.hitArea);

    // end
    if (end) {
        await end();
    }
    // width and height must be set after the scale
    if (!ignoreScale) {
        "width" in memory && memory.width !== undefined && (element.width = memory.width);
        "height" in memory && memory.height !== undefined && (element.height = memory.height);
    }
}
