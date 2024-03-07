import { SpriteOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { ICanvasBaseMemory } from "./ICanvasBaseMemory";
import { ITextureMemory } from "./ITextureMemory";

/**
 * Interface for the canvas sprite memory
 */
export interface ICanvasSpriteMemory extends SpriteOptions, ICanvasBaseMemory {
    className: "CanvasSprite",
    textureImage: ITextureMemory,
    onEvents: { [name: CanvasEventNamesType]: EventTagType }
}
