import { GameStepState } from "@drincs/pixi-vn";
import HistoryStep from "./HistoryStep";
import OpenedLabel from "./OpenedLabel";

/**
 * Interface exported step data
 */
export default interface NarrationGamState {
    stepsHistory: HistoryStep[];
    openedLabels: OpenedLabel[];
    /**
     * @deprecated use stepCounter
     */
    lastStepIndex?: number;
    stepCounter: number;
    originalStepData: GameStepState | undefined;
}
