import ICanvasBaseMemory from "../canvas/ICanvasBaseMemory";
import ITickersSteps from "../ITickersSteps";
import { TickerHistoryForExport } from "../TickerHistory";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    currentTickers: { [id: string]: TickerHistoryForExport<any> }
    currentTickersSteps: { [alias: string]: ITickersSteps }
    currentElements: { [alias: string]: ICanvasBaseMemory }
    childrenTagsOrder: string[]
}
