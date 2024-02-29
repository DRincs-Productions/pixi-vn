import { Text } from "pixi.js";
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
        return this.memorySprite
    }
    set memory(value: ICanvasTextMemory) {
        this.memorySprite = value
    }
    constructor(string?: string) {
        let text = new Text(string)
        super(text)
    }
}