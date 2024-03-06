import { ColorSource, Cursor, EventMode, IBaseTextureOptions, ObservablePoint, Sprite, SpriteSource, Texture } from "pixi.js";
import { getTexture, getTextureMemory } from "../../functions/CanvasUtility";
import { ICanvasSpriteMemory } from "../../interface/canvas/ICanvasSpriteMemory";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { CanvasEvent } from "../CanvasEvent";
import { CanvasContainer } from "./CanvasContainer";

/**
 * This class is responsible for storing a PIXI Sprite.
 * And allow to save your memory in a game save.
 */
export class CanvasSprite<T1 extends Sprite = Sprite, T2 extends ICanvasSpriteMemory = ICanvasSpriteMemory> extends CanvasContainer<T1, T2> {
    constructor(texture?: Texture | Sprite) {
        if (texture instanceof Sprite) {
            super(texture as T1)
        }
        else {
            let sprite = new Sprite(texture)
            super(sprite as T1)
        }
    }
    get memory(): T2 {
        return this.memorySprite as T2
    }
    set memory(value: T2) {
        this.memorySprite = value
    }
    get memorySprite(): ICanvasSpriteMemory {
        let elements: ICanvasSpriteMemory = {
            ...super.memoryContainer,
            anchor: { x: this.anchor.x, y: this.anchor.y },
            texture: getTextureMemory(this.view.texture),
            tint: this.tint,
            eventMode: this.eventMode,
            cursor: this.cursor,
            onEvents: this.onEvents
        }
        return elements
    }
    set memorySprite(value: ICanvasSpriteMemory) {
        super.memoryContainer = value
        this.anchor.set(value.anchor.x, value.anchor.y)
        this.view.texture = getTexture(value.texture)
        this.tint = value.tint
        this.eventMode = value.eventMode
        this.cursor = value.cursor
        this.onEvents = value.onEvents
        for (let key in this.onEvents) {
            let event = this.onEvents[key]
            let instance = GameWindowManager.getEventInstanceByClassName(event)
            if (instance) {
                this.view.on(key, () => {
                    (instance as CanvasEvent<typeof this>).fn(event, this)
                })
            }
        }
    }

    get anchor() {
        return this.view.anchor
    }
    set anchor(value: ObservablePoint) {
        this.view.anchor = value
    }
    get x() {
        return this.view.x
    }
    set x(value: number) {
        this.view.x = value
    }
    get y() {
        return this.view.y
    }
    set y(value: number) {
        this.view.y = value
    }
    get rotation() {
        return this.view.rotation
    }
    set rotation(value: number) {
        this.view.rotation = value
    }
    get tint() {
        return this.view.tint
    }
    set tint(value: ColorSource) {
        this.view.tint = value
    }
    get eventMode() {
        return this.view.eventMode
    }
    set eventMode(value: EventMode) {
        this.view.eventMode = value
    }
    get cursor() {
        return this.view.cursor
    }
    set cursor(value: Cursor | string) {
        this.view.cursor = value
    }
    onEvents: { [name: CanvasEventNamesType]: EventTagType } = {}
    on<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = GameWindowManager.getEventInstanceByClassName(className)
        if (instance) {
            this.onEvents[event] = className
            this.view.on(event, () => {
                (instance as CanvasEvent<typeof this>).fn(event, this)
            })
        }
        return this
    }
    static from(source: SpriteSource, options?: IBaseTextureOptions): CanvasSprite {
        let sprite = Sprite.from(source, options)
        let mySprite = new CanvasSprite(sprite)
        return mySprite
    }
    get texture() {
        return this.view.texture
    }
    set texture(value: Texture) {
        this.view.texture = value
    }
}
