import { CanvasBaseItemMemory, ContainerMemory, TickerHistory, TickersSequence } from "..";

/**
 * Interface exported canvas
 */
export default interface CanvasGameState {
    tickers: { [id: string]: TickerHistory<any> };
    tickersSteps: { [alias: string]: { [tickerId: string]: TickersSequence } };
    elements: { [alias: string]: CanvasBaseItemMemory };
    stage: Partial<ContainerMemory>;
    /**
     * @deprecated
     */
    elementAliasesOrder: string[];
    tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    };
}
