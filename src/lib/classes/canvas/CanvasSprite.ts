import { ContainerEvents, EventEmitter, Sprite, SpriteOptions, Texture, TextureSourceLike } from "pixi.js";
import { canvasElementDecorator } from "../../decorators/CanvasElementDecorator";
import { getEventInstanceByClassName, getEventTypeByClassName } from "../../decorators/EventDecorator";
import { getTextureMemory } from "../../functions/CanvasUtility";
import { getTexture } from "../../functions/ImageUtility";
import { ICanvasBase } from "../../interface/ICanvasBase";
import { ICanvasBaseMemory } from "../../interface/canvas/ICanvasBaseMemory";
import { ICanvasSpriteBaseMemory, ICanvasSpriteMemory } from "../../interface/canvas/ICanvasSpriteMemory";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { CanvasEvent } from "../CanvasEvent";
import { getMemoryContainer, setMemoryContainer } from "./CanvasContainer";

/**
 * This class is responsible for storing a PIXI Sprite.
 * And allow to save your memory in a game save.
 */
@canvasElementDecorator()
export class CanvasSprite<Memory extends SpriteOptions & ICanvasBaseMemory = ICanvasSpriteMemory> extends Sprite implements ICanvasBase<Memory | ICanvasSpriteMemory> {
    get memory(): Memory | ICanvasSpriteMemory {
        return getMemorySprite(this)
    }
    set memory(value: ICanvasSpriteMemory) {
        setMemorySprite(this, value)
    }
    private _onEvents: { [name: CanvasEventNamesType]: EventTagType } = {}
    get onEvents() {
        return this._onEvents
    }
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = getEventInstanceByClassName(className)
        this._onEvents[event] = className
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<ICanvasBase<any>>).fn(event, this)
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
    override on<T extends keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>(event: T, fn: (...args: EventEmitter.ArgumentMap<ContainerEvents & { [K: symbol]: any;[K: {} & string]: any; }>[Extract<T, keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>]) => void, context?: any): this {
        return super.on(event, fn, context)
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
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
        if (typeof texture === "string") {
            console.error("Error loading image")
        }
        else {
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
