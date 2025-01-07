import PauseTickerType from "../../types/PauseTickerType";
import { CanvasBaseItemMemory, ContainerMemory } from "../canvas/memory";
import { TickerHistoryForExport } from "../TickerHistory";
import TickersSteps from "../TickersSteps";

/**
 * Interface exported canvas
 */
export default interface ExportedCanvas {
    tickers: { [id: string]: TickerHistoryForExport<any> }
    tickersSteps: { [alias: string]: { [tickerId: string]: TickersSteps } }
    elements: { [alias: string]: CanvasBaseItemMemory }
    stage: Partial<ContainerMemory>
    elementAliasesOrder: string[]
    tickersOnPause: { [alias: string]: PauseTickerType }
    tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[],
        stepAlias: { id: string, alias: string }[],
    }
}
