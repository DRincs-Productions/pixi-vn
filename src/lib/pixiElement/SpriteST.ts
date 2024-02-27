import { IBaseTextureOptions, ObservablePoint, Sprite, SpriteSource, Texture } from "pixi.js";
import { ContainerSTInternal, IContainer } from "./ContainerST";
import { ExportedPixiElementType } from "./ExportedType";
import { ITextureMemory, getTexture, getTextureMemory } from "./Texture";

export interface ISpriteMemory extends ISprite {
    texture: ITextureMemory,
    elements: ExportedPixiElementType[],
}
export interface ISprite extends IContainer {
    anchor: { x: number, y: number },
}

export abstract class SpriteSTInternal<T1 extends Sprite, T2 extends ISprite> extends ContainerSTInternal<T1, T2> {
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
    static from(source: SpriteSource, options?: IBaseTextureOptions): SpriteST {
        let sprite = Sprite.from(source, options)
        let mySprite = new SpriteST()
        mySprite.pixiElement = sprite
        return mySprite
    }
}

export class SpriteST extends SpriteSTInternal<Sprite, ISpriteMemory> {
    get memory(): ISpriteMemory {
        return {
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            pivot: this.pivot,
            anchor: this.anchor,
            texture: getTextureMemory(this.pixiElement.texture)
        }
    }
    set memory(value: ISpriteMemory) {
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