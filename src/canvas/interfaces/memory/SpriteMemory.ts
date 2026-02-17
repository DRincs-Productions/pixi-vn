import type { SpriteOptions } from "@drincs/pixi-vn/pixi.js";
import { ListenerExtensionMemory } from "../../components/ListenerExtension";
import AssetMemory from "../AssetMemory";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

export interface SpriteBaseMemory extends SpriteOptions, CanvasBaseItemMemory, ListenerExtensionMemory {
    /**
     * @deprecated
     */
    textureImage?: AssetMemory;
    textureData?: AssetMemory;
}

/**
 * Interface for the canvas sprite memory
 */
export default interface SpriteMemory extends SpriteBaseMemory {}
