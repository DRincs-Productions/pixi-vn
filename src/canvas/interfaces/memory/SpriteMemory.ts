import type { SpriteOptions } from "@drincs/pixi-vn/pixi.js";
import { AsyncLoadExtensionProps } from "src/canvas/components/AsyncLoadExtension";
import { EventIdType } from "../../types/EventIdType";
import AssetMemory from "../AssetMemory";
import CanvasBaseItemMemory from "./CanvasBaseItemMemory";

export interface SpriteBaseMemory extends SpriteOptions, CanvasBaseItemMemory, AsyncLoadExtensionProps {
    /**
     * @deprecated
     */
    textureImage?: AssetMemory;
    /**
     * @deprecated
     */
    textureData?: AssetMemory;
    onEvents: { [name: string]: EventIdType };
}

/**
 * Interface for the canvas sprite memory
 */
export default interface SpriteMemory extends SpriteBaseMemory {}
