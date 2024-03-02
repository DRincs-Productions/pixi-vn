import { ColorSource, Cursor, EventMode } from "pixi.js";
import { CanvasEventNamesType } from "../../types/CanvasEventNamesType";
import { EventTagType } from "../../types/EventTagType";
import { ICanvasContainerMemory } from "./ICanvasContainerMemory";
import { ITextureMemory } from "./ITextureMemory";

/**
 * Interface for the canvas sprite memory
 */
export interface ICanvasSpriteMemory extends ICanvasContainerMemory {
    texture: ITextureMemory,
    anchor: { x: number, y: number },
    tint: ColorSource,
    eventMode: EventMode,
    cursor: Cursor | string,
    onEvents: { [name: CanvasEventNamesType]: EventTagType }
}
