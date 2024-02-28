import { IClassWithArgsHistory } from "../IClassWithArgsHistory";
import { ICanvasBaseMemory } from "../canvas/ICanvasBaseMemory";

export interface ExportedCanvas {
    currentTickers: IClassWithArgsHistory[]
    currentElements: ICanvasBaseMemory[]
}
