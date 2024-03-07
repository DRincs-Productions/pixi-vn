import { Container, ContainerEvents, EventEmitter, Sprite, SpriteOptions, Texture, TextureSourceLike } from "pixi.js";
import { getTextureMemory } from "../../functions/CanvasUtility";
import { ICanvasBaseMemory } from "../../interface/canvas/ICanvasBaseMemory";
import { ICanvasSpriteMemory } from "../../interface/canvas/ICanvasSpriteMemory";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { SupportedCanvasElement } from "../../types/SupportedCanvasElement";
import { CanvasEvent } from "../CanvasEvent";
import { CanvasBase } from "./CanvasBase";
import { getMemoryContainer } from "./CanvasContainer";

/**
 * This class is responsible for storing a PIXI Sprite.
 * And allow to save your memory in a game save.
 */
export class CanvasSprite<Memory extends SpriteOptions & ICanvasBaseMemory = ICanvasSpriteMemory> extends Sprite implements CanvasBase<Memory | ICanvasSpriteMemory> {
    get memory(): ICanvasSpriteMemory {
        return getMemorySprite(this)
    }
    private _onEvents: { [name: CanvasEventNamesType]: EventTagType } = {}
    get onEvents() {
        return this._onEvents
    }
    addCanvasChild<U extends SupportedCanvasElement[]>(...children: U): U[0] {
        return super.addChild(...children)
    }
    /**
     * addChild() does not keep in memory the children, use addCanvasChild() instead
     * @deprecated
     * @param children 
     * @returns 
     */
    override addChild<U extends Container[]>(...children: U): U[0] {
        console.warn("addChild() does not keep in memory the children, use addCanvasChild() instead")
        return super.addChild(...children)
    }
    onEvent<T extends CanvasEventNamesType, T2 extends typeof CanvasEvent<typeof this>>(event: T, eventClass: T2) {
        let className = eventClass.name
        let instance = GameWindowManager.getEventInstanceByClassName(className)
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<SupportedCanvasElement>).fn(event, this)
            })
        }
        return this
    }
    /**
     * on() does not keep in memory the event class, use onEvent() instead
     * @deprecated
     * @param event 
     * @param fn 
     * @param context 
     */
    override on<T extends keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>(event: T, fn: (...args: EventEmitter.ArgumentMap<ContainerEvents & { [K: symbol]: any;[K: {} & string]: any; }>[Extract<T, keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>]) => void, context?: any): this {
        console.warn("on() does not keep in memory the event class, use onEvent() instead")
        return super.on(event, fn, context)
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean): CanvasSprite {
        let sprite = Sprite.from(source, skipCache)
        return new CanvasSprite(sprite)
    }
}

export function getMemorySprite<T extends CanvasSprite>(element: T | CanvasSprite): ICanvasSpriteMemory {
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
