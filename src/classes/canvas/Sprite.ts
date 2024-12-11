import { ContainerChild, ContainerEvents, EventEmitter, Sprite as PixiSprite, SpriteOptions, Texture, TextureSourceLike } from "pixi.js";
import { CANVAS_SPRITE_ID } from "../../constants";
import { getEventInstanceById } from "../../decorators/event-decorator";
import { setMemorySprite } from "../../functions/canvas/canvas-memory-utility";
import { getTextureMemory } from "../../functions/canvas/canvas-utility";
import { CanvasBaseItemMemory, SpriteMemory } from "../../interface";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasEvent from "../CanvasEvent";
import CanvasBaseItem from "./CanvasBaseItem";
import { getMemoryContainer } from "./Container";

/**
 * This class is a extension of the [PIXI.Sprite class](https://pixijs.com/8.x/examples/sprite/basic), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi’VN library.
 * @example
 * ```typescript
 * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
 * const sprite = Sprite.from(texture);
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
export default class Sprite<Memory extends SpriteOptions & CanvasBaseItemMemory = SpriteMemory> extends PixiSprite implements CanvasBaseItem<Memory | SpriteMemory> {
    constructor(options?: SpriteOptions | Texture) {
        super(options)
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_SPRITE_ID
    }
    pixivnId: string = CANVAS_SPRITE_ID
    private _textureAlias?: string
    public get textureAlias() {
        if (this._textureAlias) {
            return this._textureAlias
        }
        return this.texture.source.label
    }
    public set textureAlias(value: string) {
        this._textureAlias = value
    }
    get memory(): Memory | SpriteMemory {
        return getMemorySprite(this)
    }
    set memory(value: SpriteMemory) {
        this.setMemory(value)
    }
    setMemory(value: Memory | SpriteMemory): Promise<void> {
        return setMemorySprite(this, value)
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
     * export class EventTest extends CanvasEvent<Sprite> {
     *     override fn(event: CanvasEventNamesType, sprite: Sprite): void {
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
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean): Sprite<any> {
        let sprite = PixiSprite.from(source, skipCache)
        let mySprite = new Sprite()
        mySprite.texture = sprite.texture
        return mySprite
    }
}

export function getMemorySprite<T extends Sprite<any>>(element: T | Sprite<any>): SpriteMemory {
    let temp = getMemoryContainer(element)
    return {
        ...temp,
        pixivnId: element.pixivnId,
        textureData: getTextureMemory((element as any).texture, element.textureAlias),
        anchor: { x: element.anchor.x, y: element.anchor.y },
        roundPixels: element.roundPixels,
        onEvents: element.onEvents,
    }
}
