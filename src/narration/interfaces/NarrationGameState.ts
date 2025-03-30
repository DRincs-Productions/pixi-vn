import { GameStepState } from "@drincs/pixi-vn";
import HistoryStep from "./HistoryStep";
import OpenedLabel from "./OpenedLabel";

/**
 * Interface exported step data
 */
export default interface NarrationGameState {
    /**
     * @deprecated moved to HistoryManagerStatic
     */
    stepsHistory?: HistoryStep[];
    openedLabels: OpenedLabel[];
    /**
     * @deprecated use stepCounter
     */
    lastStepIndex?: number;
    stepCounter: number;
    /**
     * @deprecated moved to HistoryManagerStatic
     */
    originalStepData?: GameStepState;
}
