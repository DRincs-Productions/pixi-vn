import { Text } from "pixi.js";
import { ICanvasTextMemory } from "../../interface/canvas/ICanvasTextTextMemory";
import { CanvasSpriteBase, ICanvasSprite } from "./CanvasSprite";

export interface ICanvasText extends ICanvasSprite {
}

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
        }
    }
    set memory(value: ICanvasTextMemory) {
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