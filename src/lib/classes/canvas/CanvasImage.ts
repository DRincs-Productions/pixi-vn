import { Container, ContainerEvents, EventEmitter, Sprite, Texture, TextureSourceLike } from "pixi.js";
import { getPixiTextureAsync } from "../../functions/ImageUtility";
import { ICanvasImageMemory } from "../../interface/canvas/ICanvasImageMemory";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { SupportedCanvasElement } from "../../types/SupportedCanvasElement";
import { CanvasEvent } from "../CanvasEvent";
import { CanvasSprite, getMemorySprite } from "./CanvasSprite";

/**
 * The base class for the image.
 */
export abstract class CanvasImageBase extends Sprite implements CanvasImageBase {
    imageLink: string
    constructor(options?: ICanvasImageMemory | string) {
        if (typeof options === "string") {
            super()
            this.imageLink = options
        }
        else {
            super(options)
            this.imageLink = options?.imageLink ?? ""
        }
    }
    /**
     * Refresh the image.
     */
    abstract refreshImage(): void


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
     * @private
     * @param event 
     * @param fn 
     * @param context 
     */
    override on<T extends keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>(event: T, fn: (...args: EventEmitter.ArgumentMap<ContainerEvents & { [K: symbol]: any;[K: {} & string]: any; }>[Extract<T, keyof ContainerEvents | keyof { [K: symbol]: any;[K: {} & string]: any; }>]) => void, context?: any): this {
        return super.on(event, fn, context)
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean): CanvasSprite {
        let sprite = Sprite.from(source, skipCache)
        return new CanvasSprite(sprite)
    }
}

/**
 * The class for the image.
 */
export class CanvasImage extends CanvasImageBase {
    constructor(image: string) {
        super(image)
        this.refreshImage()
    }
    refreshImage() {
        getPixiTextureAsync(this.imageLink).then((texture) => {
            if (typeof texture === "string") {
                // this.pixiElement.text = texture
            }
            else {
                // this.pixiElement.text = ""
                this.texture = texture
            }
        })
    }
}

/**
 * The class for the image, but asynchronously.
 * Must use refreshImage() to load the image.
 */
export class CanvasImageAsync extends CanvasImageBase {
    async refreshImage() {
        getPixiTextureAsync(this.imageLink)
            .then((texture) => {
                if (typeof texture === "string") {
                    // this.pixiElement.text = texture
                }
                else {
                    // this.pixiElement.text = ""
                    this.texture = texture
                }
            })
            .catch(() => {
                console.error("Error loading image")
                // this.pixiElement.text = "Error loading image"
            })
    }
}

export function getMemoryCanvasImage(element: CanvasImageBase): ICanvasImageMemory {
    let temp = getMemorySprite(element as any)
    return {
        ...temp,
        className: "CanvasImage",
        imageLink: element.imageLink,
    }
}

export function getMemoryCanvasImageAsync(element: CanvasImageBase): ICanvasImageMemory {
    let temp = getMemorySprite(element as any)
    return {
        ...temp,
        className: "CanvasImageAsync",
        imageLink: element.imageLink,
    }
}
