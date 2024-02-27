import { Text } from "pixi.js";
import { ISprite, SpriteSTInternal } from "./SpriteST";

interface ITextMemory extends IText {
}
interface IText extends ISprite {
}

export class TextST extends SpriteSTInternal<Text, ITextMemory> {
    get memory(): ITextMemory {
        throw new Error("Method not implemented.");
    }
    constructor(string?: string) {
        let text = new Text(string)
        super(text)
    }
}