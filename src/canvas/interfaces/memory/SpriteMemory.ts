import type { SpriteOptions } from "@drincs/pixi-vn/pixi.js";
import { EventIdType } from "../../types/EventIdType";
import TextureMemory from "../TextureMemory";
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
