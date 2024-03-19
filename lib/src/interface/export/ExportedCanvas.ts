import ICanvasBaseMemory from "../canvas/ICanvasBaseMemory";
import { IClassWithArgsHistoryForExport } from "../IClassWithArgsHistory";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    currentTickers: IClassWithArgsHistoryForExport<any>[]
    currentElements: { [tag: string]: ICanvasBaseMemory }
    childrenTagsOrder: string[]
}
