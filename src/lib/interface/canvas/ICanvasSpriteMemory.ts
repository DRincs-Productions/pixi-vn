import { ICanvasSprite } from "../../classes/canvas/CanvasSprite";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";
import { ITextureMemory } from "./ITextureMemory";

export interface ICanvasSpriteMemory extends ICanvasSprite {
    className: string,
    texture: ITextureMemory,
    elements: ICanvasBaseMemory[],
}