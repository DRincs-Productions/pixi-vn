import { SpriteOptions } from "pixi.js";
import { TextureMemory } from "../../../canvas";
import { EventIdType } from "../../../types/EventIdType";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

export interface SpriteBaseMemory extends SpriteOptions, CanvasBaseItemMemory {
    /**
     * @deprecated
     */
    textureImage?: TextureMemory;
    textureData: TextureMemory;
    onEvents: { [name: string]: EventIdType };
}

/**
 * Interface for the canvas sprite memory
 */
export default interface SpriteMemory extends SpriteBaseMemory {}
