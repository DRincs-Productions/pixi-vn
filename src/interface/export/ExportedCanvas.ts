import PauseTickerType from "../../types/PauseTickerType";
import { CanvasBaseMemory, CanvasContainerMemory } from "../canvas/canvas-memory";
import { TickerHistoryForExport } from "../TickerHistory";
import TickersSteps from "../TickersSteps";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    tickers: { [id: string]: TickerHistoryForExport<any> }
    tickersSteps: { [alias: string]: { [tickerId: string]: TickersSteps } }
    elements: { [alias: string]: CanvasBaseMemory }
    stage: Partial<CanvasContainerMemory>
    elementAliasesOrder: string[]
    tickersOnPause: { [alias: string]: PauseTickerType }
}
