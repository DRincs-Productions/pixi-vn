import type { GameStepState } from "@drincs/pixi-vn";
import type { HistoryStep } from "../../narration";

/**
 * Interface exported step data
 */
export default interface HistoryGameState {
    stepsHistory: HistoryStep[];
    originalStepData: GameStepState | undefined;
}
