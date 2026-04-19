import type { SpriteOptions } from "@drincs/pixi-vn/pixi.js";
import type { AdditionalPositionsExtensionProps } from "../../components/AdditionalPositionsExtension";
import type { ListenerExtensionMemory } from "../../components/ListenerExtension";
import type AssetMemory from "../AssetMemory";
import type CanvasBaseItemMemory from "./CanvasBaseItemMemory";

export interface SpriteBaseMemory
    extends SpriteOptions,
        CanvasBaseItemMemory,
        ListenerExtensionMemory,
        AdditionalPositionsExtensionProps {
    textureData?: AssetMemory;
}

/**
 * Interface for the canvas sprite memory
 */
export default interface SpriteMemory extends SpriteBaseMemory {}
