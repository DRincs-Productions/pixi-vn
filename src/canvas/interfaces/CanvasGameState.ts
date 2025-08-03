import { CanvasBaseItemMemory, ContainerMemory, TickerHistory, TickersSequence } from "..";
import PauseTickerType from "../types/PauseTickerType";

/**
 * Interface exported canvas
 */
export default interface CanvasGameState {
    tickers: { [id: string]: TickerHistory<any> };
    tickersSteps: { [alias: string]: { [tickerId: string]: TickersSequence } };
    elements: { [alias: string]: CanvasBaseItemMemory };
    stage: Partial<ContainerMemory>;
    elementAliasesOrder: string[];
    /**
     * @deprecated
     */
    tickersOnPause: { [alias: string]: PauseTickerType };
    tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    };
}
