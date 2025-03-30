import { GameStepState } from "@drincs/pixi-vn";
import { HistoryStep } from "../../narration";

/**
 * Interface exported step data
 */
export default interface HistoryGameState {
    stepsHistory: HistoryStep[];
    originalStepData: GameStepState | undefined;
}
