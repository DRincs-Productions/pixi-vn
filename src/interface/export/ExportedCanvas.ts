import ICanvasBaseMemory from "../canvas/ICanvasBaseMemory";
import ITickersSteps from "../ITickersSteps";
import { TickerHistoryForExport } from "../TickerHistory";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    currentTickers: { [id: string]: TickerHistoryForExport<any> }
    currentTickersSteps: { [tag: string]: ITickersSteps }
    currentElements: { [tag: string]: ICanvasBaseMemory }
    childrenTagsOrder: string[]
}
