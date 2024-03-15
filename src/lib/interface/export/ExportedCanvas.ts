import { IClassWithArgsHistoryForExport } from "../IClassWithArgsHistory";
import { ICanvasBaseMemory } from "../canvas/ICanvasBaseMemory";

/**
 * Interface exported canvas
 */
export interface ExportedCanvas {
    currentTickers: IClassWithArgsHistoryForExport<any>[]
    currentElements: { [tag: string]: ICanvasBaseMemory }
    childrenTagsOrder: string[]
}
