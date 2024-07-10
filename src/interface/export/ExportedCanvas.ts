import ICanvasBaseMemory from "../canvas/ICanvasBaseMemory";
import { IClassWithArgsHistoryForExport } from "../IClassWithArgsHistory";
import ITickersSteps from "../ITickersSteps";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    currentTickers: { [id: string]: IClassWithArgsHistoryForExport<any> }
    currentTickersSteps: { [tag: string]: ITickersSteps }
    currentElements: { [tag: string]: ICanvasBaseMemory }
    childrenTagsOrder: string[]
}
