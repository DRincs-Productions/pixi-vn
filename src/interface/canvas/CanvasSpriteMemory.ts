import { SpriteOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../types";
import { EventIdType } from "../../types/EventIdType";
import CanvasBaseMemory from "./CanvasBaseMemory";
import TextureMemory from "./TextureMemory";

export interface CanvasSpriteBaseMemory extends SpriteOptions, CanvasBaseMemory {
    textureImage: TextureMemory,
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}

/**
 * Interface for the canvas sprite memory
 */
export default interface CanvasSpriteMemory extends CanvasSpriteBaseMemory {
}
