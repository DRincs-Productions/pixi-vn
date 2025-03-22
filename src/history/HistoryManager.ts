import { GameStepState } from "@drincs/pixi-vn";
import GameUnifier from "../unifier";
import { restoreDiffChanges } from "../utils/diff-utility";
import { logger } from "../utils/log-utility";
import HistoryManagerStatic from "./HistoryManagerStatic";
import HistoryManagerInterface from "./interfaces/HistoryManagerInterface";

/**
 * This class is a class that manages the steps and labels of the game.
 */
export default class HistoryManager implements HistoryManagerInterface {
    static getOldGameState(steps: number, restoredStep: GameStepState): GameStepState {
        if (steps <= 0) {
            return restoredStep;
        }
        if (HistoryManagerStatic._stepsHistory.length == 0) {
            return restoredStep;
        }
        let lastHistoryStep = HistoryManagerStatic.lastHistoryStep;
        if (lastHistoryStep?.diff) {
            try {
                let result = restoreDiffChanges(restoredStep, lastHistoryStep.diff);
                GameUnifier.stepCounter = lastHistoryStep.index;
                HistoryManagerStatic._stepsHistory.pop();
                return this.getOldGameState(steps - 1, result);
            } catch (e) {
                logger.error("Error applying diff", e);
                return restoredStep;
            }
        } else {
            logger.error("You can't go back, there is no step to go back");
            return restoredStep;
        }
    }
}
