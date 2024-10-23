import ICanvasBaseMemory from "../canvas/ICanvasBaseMemory";
import ITickersSteps from "../ITickersSteps";
import { TickerHistoryForExport } from "../TickerHistory";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    tickers: { [id: string]: TickerHistoryForExport<any> }
    tickersSteps: { [alias: string]: { [tickerId: string]: ITickersSteps } }
    elements: { [alias: string]: ICanvasBaseMemory }
    elementAliasesOrder: string[]
}
