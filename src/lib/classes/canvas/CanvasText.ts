import { Text } from "pixi.js";
import { ICanvasTextTextMemory } from "../../interface/canvas/ICanvasTextTextMemory";
import { CanvasSpriteBase, ICanvasSprite } from "../../pixiElement/SpriteST";

export interface ICanvasText extends ICanvasSprite {
}

export class CanvasText extends CanvasSpriteBase<Text, ICanvasTextTextMemory> {
    get memory(): ICanvasTextTextMemory {
        return {
            elements: [],
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            pivot: { x: this.pivot.x, y: this.pivot.y },
            anchor: { x: this.anchor.x, y: this.anchor.y },
        }
    }
    set memory(value: ICanvasTextTextMemory) {
        this.x = value.x
        this.y = value.y
        this.rotation = value.rotation
        this.pivot = value.pivot
        this.anchor.set(value.anchor.x, value.anchor.y)
    }
    constructor(string?: string) {
        let text = new Text(string)
        super(text)
    }
}