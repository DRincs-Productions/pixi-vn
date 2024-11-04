import PauseTickerType from "../../types/PauseTickerType";
import { CanvasBaseMemory, CanvasContainerMemory } from "../canvas/canvas-memory";
import ITickersSteps from "../ITickersSteps";
import { TickerHistoryForExport } from "../TickerHistory";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    tickers: { [id: string]: TickerHistoryForExport<any> }
    tickersSteps: { [alias: string]: { [tickerId: string]: ITickersSteps } }
    elements: { [alias: string]: CanvasBaseMemory }
    stage: Partial<CanvasContainerMemory>
    elementAliasesOrder: string[]
    tickersOnPause: { [alias: string]: PauseTickerType }
}
