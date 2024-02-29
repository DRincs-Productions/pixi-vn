import { Text } from "pixi.js";
import { getTexture, getTextureMemory } from "../../functions/CanvasUtility";
import { ICanvasTextMemory } from "../../interface/canvas/ICanvasTextTextMemory";
import { CanvasSpriteBase, ICanvasSprite } from "./CanvasSprite";

export interface ICanvasText extends ICanvasSprite {
}

/**
 * This class is responsible for storing a PIXI Text.
 * And allow to save your memory in a game save.
 */
export class CanvasText extends CanvasSpriteBase<Text, ICanvasTextMemory> {
    get memory(): ICanvasTextMemory {
        return {
            className: this.constructor.name,
            elements: [],
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            pivot: { x: this.pivot.x, y: this.pivot.y },
            anchor: { x: this.anchor.x, y: this.anchor.y },
            scale: { x: this.scale.x, y: this.scale.y },
            tint: this.tint,
            texture: getTextureMemory(this.pixiElement.texture),
        }
    }
    set memory(value: ICanvasTextMemory) {
        this.x = value.x
        this.y = value.y
        this.rotation = value.rotation
        this.pivot = value.pivot
        this.anchor.set(value.anchor.x, value.anchor.y)
        this.scale.set(value.scale.x, value.scale.y)
        this.tint = value.tint
        this.pixiElement.texture = getTexture(value.texture)
    }
    constructor(string?: string) {
        let text = new Text(string)
        super(text)
    }
}