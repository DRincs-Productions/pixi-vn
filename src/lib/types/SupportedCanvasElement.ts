import { CanvasContainer } from "../classes/canvas/CanvasContainer";
import { CanvasImage, CanvasImageAsync } from "../classes/canvas/CanvasImage";
import { CanvasSprite } from "../classes/canvas/CanvasSprite";
import { ICanvasContainerMemory } from "../interface/canvas/ICanvasContainerMemory";
import { ICanvasImageMemory } from "../interface/canvas/ICanvasImageMemory";
import { ICanvasSpriteMemory } from "../interface/canvas/ICanvasSpriteMemory";

export type SupportedCanvasElement = CanvasContainer | CanvasSprite | CanvasImage | CanvasImage | CanvasImageAsync
export type SupportedCanvasElementMemory = ICanvasContainerMemory | ICanvasSpriteMemory | ICanvasSpriteMemory | ICanvasImageMemory
