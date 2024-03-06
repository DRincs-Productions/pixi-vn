import { Text, TextOptions } from "pixi.js";
import { ICanvasTextMemory } from "../../interface/canvas/ICanvasTextTextMemory";
import { CanvasContainer } from "./CanvasContainer";

/**
 * This class is responsible for storing a PIXI Text.
 * And allow to save your memory in a game save.
 */
export class CanvasText extends CanvasContainer<Text, ICanvasTextMemory> {
    get memory(): ICanvasTextMemory {
        return this.memoryContainer
    }
    set memory(value: ICanvasTextMemory) {
        this.memoryContainer = value
    }
    constructor(options?: TextOptions) {
        let text = new Text(options)
        super(text)
    }
}