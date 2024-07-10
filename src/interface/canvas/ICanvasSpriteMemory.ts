import { SpriteOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import ICanvasBaseMemory from "./ICanvasBaseMemory";
import ITextureMemory from "./ITextureMemory";

export interface ICanvasSpriteBaseMemory extends SpriteOptions, ICanvasBaseMemory {
    textureImage: ITextureMemory,
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}

/**
 * Interface for the canvas sprite memory
 */
export default interface ICanvasSpriteMemory extends ICanvasSpriteBaseMemory {
    className: "CanvasSprite",
}
