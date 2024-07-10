import { ContainerChild, ContainerEvents, EventEmitter, Sprite, SpriteOptions, Texture, TextureSourceLike } from "pixi.js";
import { getEventInstanceByClassName, getEventTypeByClassName } from "../../decorators/EventDecorator";
import { getTextureMemory } from "../../functions/CanvasUtility";
import { getTexture } from "../../functions/TextureUtility";
import ICanvasBaseMemory from "../../interface/canvas/ICanvasBaseMemory";
import ICanvasSpriteMemory, { ICanvasSpriteBaseMemory } from "../../interface/canvas/ICanvasSpriteMemory";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasEvent from "../CanvasEvent";
import CanvasBase from "./CanvasBase";
import { getMemoryContainer, setMemoryContainer } from "./CanvasContainer";

/**
 * This class is a extension of the [PIXI.Sprite class](https://pixijs.com/8.x/examples/sprite/basic), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi'VN library.
 * @example
 * ```typescript
 * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
 * const sprite = CanvasSprite.from(texture);
 *
 * sprite.anchor.set(0.5);
 * sprite.x = GameWindowManager.screen.width / 2;
 * sprite.y = GameWindowManager.screen.height / 2;
 *
 * sprite.eventMode = 'static';
 * sprite.cursor = 'pointer';
 * sprite.onEvent('pointerdown', EventTest);
 *
 * GameWindowManager.addCanvasElement("bunny", sprite);
 * ```
 */
export default class CanvasSprite<Memory extends SpriteOptions & ICanvasBaseMemory = ICanvasSpriteMemory> extends Sprite implements CanvasBase<Memory | ICanvasSpriteMemory> {
    get memory(): Memory | ICanvasSpriteMemory {
        return getMemorySprite(this)
    }
    set memory(value: ICanvasSpriteMemory) {
        setMemorySprite(this, value)
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
     * export class EventTest extends CanvasEvent<CanvasSprite> {
     *     override fn(event: CanvasEventNamesType, sprite: CanvasSprite): void {
     *         if (event === 'pointerdown') {
     *             sprite.scale.x *= 1.25;
     *             sprite.scale.y *= 1.25;
     *         }
     *     }
     * }
     * ```
     * 
     * ```typescript
     * let sprite = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
     * await sprite.load()
     *
     * sprite.eventMode = 'static';
     * sprite.cursor = 'pointer';
     * sprite.onEvent('pointerdown', EventTest);
     *
     * GameWindowManager.addCanvasElement("bunny", sprite);
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
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any;[K: {} & string]: any; }>(event: T, fn: (...args: EventEmitter.ArgumentMap<ContainerEvents<ContainerChild> & { [K: symbol]: any;[K: {} & string]: any; }>[Extract<T, keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any;[K: {} & string]: any; }>]) => void, context?: any): this {
        return super.on(event, fn, context)
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean): CanvasSprite<any> {
        let sprite = Sprite.from(source, skipCache)
        let mySprite = new CanvasSprite()
        mySprite.texture = sprite.texture
        return mySprite
    }
}

export function getMemorySprite<T extends CanvasSprite<any>>(element: T | CanvasSprite<any>): ICanvasSpriteMemory {
    let temp = getMemoryContainer(element)
    return {
        ...temp,
        className: "CanvasSprite",
        textureImage: getTextureMemory((element as any).texture),
        anchor: { x: element.anchor.x, y: element.anchor.y },
        roundPixels: element.roundPixels,
        onEvents: element.onEvents,
    }
}

export function setMemorySprite<Memory extends ICanvasSpriteBaseMemory>(element: CanvasSprite<any>, memory: Memory) {
    setMemoryContainer(element, memory)
    getTexture(memory.textureImage.image).then((texture) => {
        if (texture) {
            element.texture = texture
        }
    })
    if (memory.anchor) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor)
        }
        else {
            element.anchor.set(memory.anchor.x, memory.anchor.y)
        }
    }
    memory.roundPixels && (element.roundPixels = memory.roundPixels)
    for (let event in memory.onEvents) {
        let className = memory.onEvents[event]
        let instance = getEventTypeByClassName(className)
        if (instance) {
            element.onEvent(event, instance)
        }
    }
}
