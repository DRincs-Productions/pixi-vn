import { ICanvasSprite } from "../../classes/canvas/CanvasSprite";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";
import { ITextureMemory } from "./ITextureMemory";

/**
 * Interface for the canvas sprite memory
 */
export interface ICanvasSpriteMemory extends ICanvasSprite {
    className: string,
    texture: ITextureMemory,
    elements: ICanvasBaseMemory[],
}