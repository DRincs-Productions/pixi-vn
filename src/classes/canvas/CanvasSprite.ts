import { ContainerChild, ContainerEvents, EventEmitter, Sprite, SpriteOptions, Texture, TextureSourceLike } from "pixi.js";
import { getEventInstanceById, getEventTypeById } from "../../decorators/EventDecorator";
import { getTextureMemory } from "../../functions/canvas/CanvasUtility";
import { getTexture } from "../../functions/TextureUtility";
import { ICanvasBaseMemory, ICanvasSpriteBaseMemory, ICanvasSpriteMemory } from "../../interface";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasEvent from "../CanvasEvent";
import CanvasBase from "./CanvasBase";
import { getMemoryContainer, setMemoryContainer } from "./CanvasContainer";

export const CANVAS_SPRITE_ID = "Sprite"

/**
 * This class is a extension of the [PIXI.Sprite class](https://pixijs.com/8.x/examples/sprite/basic), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi'VN library.
 * @example
 * ```typescript
 * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
 * const sprite = CanvasSprite.from(texture);
 *
 * sprite.anchor.set(0.5);
 * sprite.x = canvas.screen.width / 2;
 * sprite.y = canvas.screen.height / 2;
 *
 * sprite.eventMode = 'static';
 * sprite.cursor = 'pointer';
 * sprite.onEvent('pointerdown', EventTest);
 *
 * canvas.add("bunny", sprite);
 * ```
 */
export default class CanvasSprite<Memory extends SpriteOptions & ICanvasBaseMemory = ICanvasSpriteMemory> extends Sprite implements CanvasBase<Memory | ICanvasSpriteMemory> {
    constructor(options?: SpriteOptions | Texture) {
        super(options)
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_SPRITE_ID
    }
    pixivnId: string = CANVAS_SPRITE_ID
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
     * canvas.add("bunny", sprite);
     * ```
     */
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let id = eventClass.prototype.id
        let instance = getEventInstanceById(id)
        this._onEvents[event] = id
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
        pixivnId: element.pixivnId,
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
        let id = memory.onEvents[event]
        let instance = getEventTypeById(id)
        if (instance) {
            element.onEvent(event, instance)
        }
    }
}
