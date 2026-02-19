import { ContainerEvents, ContainerOptions, EventEmitter, Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_CONTAINER_ID } from "../../constants";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { default as RegisteredCanvasComponents, setMemoryContainer } from "../decorators/canvas-element-decorator";
import { importCanvasElement } from "../functions/canvas-import-utility";
import { getMemoryContainer } from "../functions/canvas-memory-utility";
import ContainerMemory from "../interfaces/memory/ContainerMemory";
import ContainerChild from "../types/ContainerChild";
import { addListenerHandler, OnEventsHandlers } from "./ListenerExtension";

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
    async setMemory(value: Memory): Promise<void> {
        await this.importChildren(value);
        return await setMemoryContainer(this, value);
    }
    protected async importChildren(value: Memory) {
        for (let i = 0; i < value.elements.length; i++) {
            let child = value.elements[i];
            let element = await importCanvasElement<any, C>(child);
            this.addChild(element);
        }
    }
    readonly onEventsHandlers: OnEventsHandlers = {};
    override on<T extends keyof ContainerEvents<C> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (
            ...args: [
                ...EventEmitter.ArgumentMap<ContainerEvents<C> & { [K: symbol]: any; [K: {} & string]: any }>[Extract<
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
}
RegisteredCanvasComponents.add<ContainerMemory, typeof Container>(Container, {
    name: CANVAS_CONTAINER_ID,
    copyProperty: async (component, memory) => {
        return await setMemoryContainer(component as Container, memory);
    },
});
