import { Sprite } from "pixi.js";
import { getTexture, getTextureMemory } from "../../functions/CanvasUtility";
import { ICanvasSpriteMemory } from "../../interface/canvas/ICanvasSpriteMemory";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { CanvasEvent } from "../CanvasEvent";
import { CanvasBase } from "./CanvasBase";

/**
 * This class is responsible for storing a PIXI Sprite.
 * And allow to save your memory in a game save.
 */
export class CanvasSprite extends Sprite implements CanvasBase<ICanvasSpriteMemory> {
    get memory(): ICanvasSpriteMemory {
        return this.memorySprite as ICanvasSpriteMemory
    }
    set memory(value: ICanvasSpriteMemory) {
        this.memorySprite = value
    }
    get memorySprite(): ICanvasSpriteMemory {
        let elements: ICanvasSpriteMemory = {
            ...super.memoryContainer,
            anchor: { x: this.anchor.x, y: this.anchor.y },
            textureImage: getTextureMemory(this.view.texture),
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
        this.view.texture = getTexture(value.textureImage)
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
    static from(source: Texture | TextureSourceLike, skipCache?: boolean): CanvasSprite {
        let sprite = Sprite.from(source, skipCache)
        let mySprite = new CanvasSprite(sprite)
        return mySprite
    }
}
