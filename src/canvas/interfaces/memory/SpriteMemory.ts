import type { SpriteOptions } from "@drincs/pixi-vn/pixi.js";
import { EventIdType } from "../../types/EventIdType";
import AssetMemory from "../AssetMemory";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

export interface SpriteBaseMemory extends SpriteOptions, CanvasBaseItemMemory {
    /**
     * @deprecated
     */
    textureImage?: AssetMemory;
    textureData?: AssetMemory;
    onEvents: { [name: string]: EventIdType };
}

/**
 * Interface for the canvas sprite memory
 */
export default interface SpriteMemory extends SpriteBaseMemory {}
