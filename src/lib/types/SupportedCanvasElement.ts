import { CanvasContainer } from "../classes/canvas/CanvasContainer";
import { CanvasImage, CanvasImageAsync } from "../classes/canvas/CanvasImage";
import { CanvasSprite } from "../classes/canvas/CanvasSprite";
import { CanvasText } from "../classes/canvas/CanvasText";
import { ICanvasContainerMemory } from "../interface/canvas/ICanvasContainerMemory";
import { ICanvasImageMemory } from "../interface/canvas/ICanvasImageMemory";
import { ICanvasSpriteMemory } from "../interface/canvas/ICanvasSpriteMemory";
import { ICanvasTextMemory } from "../interface/canvas/ICanvasTextTextMemory";

export type SupportedCanvasElement = CanvasContainer | CanvasSprite | CanvasImage | CanvasImage | CanvasImageAsync | CanvasText
export type SupportedCanvasElementMemory = ICanvasContainerMemory | ICanvasSpriteMemory | ICanvasSpriteMemory | ICanvasImageMemory | ICanvasTextMemory
