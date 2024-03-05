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
            texture: getTextureMemory(this.pixiElement.texture),
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
        this.pixiElement.texture = getTexture(value.texture)
        this.tint = value.tint
        this.eventMode = value.eventMode
        this.cursor = value.cursor
        this.onEvents = value.onEvents
        for (let key in this.onEvents) {
            let event = this.onEvents[key]
            let instance = GameWindowManager.getEventInstanceByClassName(event)
            if (instance) {
                this.pixiElement.on(key, () => {
                    (instance as CanvasEvent<typeof this>).fn(event, this)
                })
            }
        }
    }

    get anchor() {
        return this.pixiElement.anchor
    }
    set anchor(value: ObservablePoint) {
        this.pixiElement.anchor = value
    }
    get x() {
        return this.pixiElement.x
    }
    set x(value: number) {
        this.pixiElement.x = value
    }
    get y() {
        return this.pixiElement.y
    }
    set y(value: number) {
        this.pixiElement.y = value
    }
    get rotation() {
        return this.pixiElement.rotation
    }
    set rotation(value: number) {
        this.pixiElement.rotation = value
    }
    get tint() {
        return this.pixiElement.tint
    }
    set tint(value: ColorSource) {
        this.pixiElement.tint = value
    }
    get eventMode() {
        return this.pixiElement.eventMode
    }
    set eventMode(value: EventMode) {
        this.pixiElement.eventMode = value
    }
    get cursor() {
        return this.pixiElement.cursor
    }
    set cursor(value: Cursor | string) {
        this.pixiElement.cursor = value
    }
    onEvents: { [name: CanvasEventNamesType]: EventTagType } = {}
    on<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = GameWindowManager.getEventInstanceByClassName(className)
        if (instance) {
            this.onEvents[event] = className
            this.pixiElement.on(event, () => {
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
        return this.pixiElement.texture
    }
    set texture(value: Texture) {
        this.pixiElement.texture = value
    }
}
