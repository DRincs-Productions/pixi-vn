import { IClassWithArgsHistory } from "../IClassWithArgsHistory";
import { ICanvasBaseMemory } from "../canvas/ICanvasBaseMemory";

/**
 * Interface exported canvas
 */
export interface ExportedCanvas {
    currentTickers: IClassWithArgsHistory[]
    currentElements: ICanvasBaseMemory[]
}
