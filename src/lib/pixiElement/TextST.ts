import { Text } from "pixi.js";
import { ExportedPixiElementType } from "./ExportedType";
import { ISprite, SpriteSTInternal } from "./SpriteST";

export interface ITextMemory extends IText {
    elements: ExportedPixiElementType[],
}
interface IText extends ISprite {
}

export class CanvasText extends SpriteSTInternal<Text, ITextMemory> {
    get memory(): ITextMemory {
        return {
            elements: [],
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            pivot: { x: this.pivot.x, y: this.pivot.y },
            anchor: { x: this.anchor.x, y: this.anchor.y },
        }
    }
    set memory(value: ITextMemory) {
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