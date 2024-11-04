import PauseTickerType from "../../types/PauseTickerType";
import { CanvasBaseMemory } from "../canvas/canvas-memory";
import ITickersSteps from "../ITickersSteps";
import { TickerHistoryForExport } from "../TickerHistory";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    tickers: { [id: string]: TickerHistoryForExport<any> }
    tickersSteps: { [alias: string]: { [tickerId: string]: ITickersSteps } }
    elements: { [alias: string]: CanvasBaseMemory }
    elementAliasesOrder: string[]
    tickersOnPause: { [alias: string]: PauseTickerType }
}
