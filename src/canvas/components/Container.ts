import { ContainerEvents, ContainerOptions, EventEmitter, Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_CONTAINER_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import CanvasEvent from "../classes/CanvasEvent";
import { default as RegisteredCanvasComponents, setMemoryContainer } from "../decorators/canvas-element-decorator";
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
