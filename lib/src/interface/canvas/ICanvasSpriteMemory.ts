import { SpriteOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import ICanvasBaseMemory from "./ICanvasBaseMemory";
import ITextureMemory from "./ITextureMemory";

export interface ICanvasSpriteBaseMemory extends SpriteOptions, ICanvasBaseMemory {
    textureImage: ITextureMemory,
    onEvents: { [name: CanvasEventNamesType]: EventTagType }
}

/**
 * Interface for the canvas sprite memory
 */
export default interface ICanvasSpriteMemory extends ICanvasSpriteBaseMemory {
    className: "CanvasSprite",
}
