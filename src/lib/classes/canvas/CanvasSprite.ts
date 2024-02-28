import { IBaseTextureOptions, ObservablePoint, Sprite, SpriteSource, Texture } from "pixi.js";
import { getTexture, getTextureMemory } from "../../functions/CanvasUtility";
import { ICanvasContainerMemory } from "../../interface/canvas/ICanvasContainerMemory";
import { ICanvasSpriteMemory } from "../../interface/canvas/ICanvasSpriteMemory";
import { CanvasContainerBase, ICanvasContainer } from "./CanvasContainer";

export interface ICanvasSprite extends ICanvasContainer {
    anchor: { x: number, y: number },
}

export abstract class CanvasSpriteBase<T1 extends Sprite, T2 extends ICanvasContainerMemory> extends CanvasContainerBase<T1, T2> {
    constructor(sprite: T1) {
        super(sprite)
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
    static from(source: SpriteSource, options?: IBaseTextureOptions): CanvasSprite {
        let sprite = Sprite.from(source, options)
        let mySprite = new CanvasSprite()
        mySprite.pixiElement = sprite
        return mySprite
    }
}

/**
 * This class is responsible for storing a PIXI Sprite.
 * And allow to save your memory in a game save.
 */
export class CanvasSprite extends CanvasSpriteBase<Sprite, ICanvasSpriteMemory> {
    get memory(): ICanvasSpriteMemory {
        let elements: ICanvasSpriteMemory = {
            className: this.constructor.name,
            elements: [],
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            pivot: { x: this.pivot.x, y: this.pivot.y },
            anchor: { x: this.anchor.x, y: this.anchor.y },
            texture: getTextureMemory(this.pixiElement.texture)
        }
        return elements
    }
    set memory(value: ICanvasSpriteMemory) {
        this.x = value.x
        this.y = value.y
        this.rotation = value.rotation
        this.pivot = value.pivot
        this.anchor.set(value.anchor.x, value.anchor.y)
        this.pixiElement.texture = getTexture(value.texture)
    }
    constructor(texture?: Texture) {
        let sprite = new Sprite(texture)
        super(sprite)
    }
}