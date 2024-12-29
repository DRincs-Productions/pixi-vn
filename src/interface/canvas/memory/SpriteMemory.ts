import { SpriteOptions } from "pixi.js";
import { CanvasEventNamesType } from "../../../types";
import { EventIdType } from "../../../types/EventIdType";
import TextureMemory from "../TextureMemory";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

export interface SpriteBaseMemory extends SpriteOptions, CanvasBaseItemMemory {
    /**
     * @deprecated
     */
    textureImage?: TextureMemory,
    textureData: TextureMemory,
    onEvents: { [name: CanvasEventNamesType]: EventIdType }
}

/**
 * Interface for the canvas sprite memory
 */
export default interface SpriteMemory extends SpriteBaseMemory { }
