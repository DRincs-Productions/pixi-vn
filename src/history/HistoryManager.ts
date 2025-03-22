import { GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import { diff } from "deep-diff";
import { HistoryChoiceMenuOption, HistoryStep, NarrativeHistory } from "../narration";
import GameUnifier from "../unifier";
import { createExportableElement } from "../utils";
import { restoreDiffChanges } from "../utils/diff-utility";
import { logger } from "../utils/log-utility";
import HistoryManagerStatic from "./HistoryManagerStatic";
import HistoryManagerInterface from "./interfaces/HistoryManagerInterface";

/**
 * This class is a class that manages the steps and labels of the game.
 */
export default class HistoryManager implements HistoryManagerInterface {
    get stepsHistory() {
        return HistoryManagerStatic._stepsHistory;
    }
    private getOldGameState(steps: number, restoredStep: GameStepState): GameStepState {
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
    async restoreOldGameState(originalStepData: GameStepState, navigate: (path: string) => void, steps: number = 1) {
        if (steps <= 0) {
            logger.warn("The parameter steps must be greater than 0");
            return;
        }
        if (this.stepsHistory.length <= 1) {
            logger.warn("You can't go back, there is no step to go back");
            return;
        }
        let restoredStep = createExportableElement(this.getOldGameState(steps, originalStepData));
        if (restoredStep) {
            await GameUnifier.restoreGameStepState(restoredStep, navigate);
        } else {
            logger.error("Error going back");
        }
    }
    add(originalStepData: GameStepState, historyInfo: HistoryInfo = {}) {
        const currentStepData: GameStepState = GameUnifier.currentGameStepState;
        let data = diff(originalStepData, currentStepData);
        this.stepsHistory.push({
            ...(historyInfo as Omit<HistoryStep, "diff">),
            diff: data,
        });
    }
    get narrativeHistory(): NarrativeHistory[] {
        let list: NarrativeHistory[] = [];
        this.stepsHistory.forEach((step) => {
            let dialoge = step.dialoge;
            let requiredChoices = step.choices;
            let inputValue = step.inputValue;
            if (
                list.length > 0 &&
                list[list.length - 1].choices &&
                !list[list.length - 1].playerMadeChoice &&
                step.currentLabel
            ) {
                let oldChoices = list[list.length - 1].choices;
                if (oldChoices) {
                    let choiceMade = false;
                    if (step.choiceIndexMade !== undefined && oldChoices.length > step.choiceIndexMade) {
                        oldChoices[step.choiceIndexMade].isResponse = true;
                        choiceMade = true;
                    }
                    list[list.length - 1].playerMadeChoice = choiceMade;
                    list[list.length - 1].choices = oldChoices;
                }
            }
            if (inputValue && list.length > 0) {
                list[list.length - 1].inputValue = inputValue;
            }
            if (dialoge || requiredChoices) {
                let choices: HistoryChoiceMenuOption[] | undefined = requiredChoices?.map((choice, index) => {
                    let hidden: boolean = false;
                    if (choice.oneTime && step.alreadyMadeChoices && step.alreadyMadeChoices.includes(index)) {
                        hidden = true;
                    }
                    return {
                        text: choice.text,
                        type: choice.type,
                        isResponse: false,
                        hidden: hidden,
                    };
                });
                // if all choices are hidden find onlyHaveNoChoice
                if (choices && choices.every((choice) => choice.hidden)) {
                    let onlyHaveNoChoice = choices.find((choice) => choice.hidden === false);
                    if (onlyHaveNoChoice) {
                        onlyHaveNoChoice.hidden = false;
                    }
                }
                list.push({
                    dialoge: dialoge,
                    playerMadeChoice: false,
                    choices: choices,
                    stepIndex: step.index,
                });
            }
        });
        return list;
    }
    removeNarrativeHistory(itemsNumber?: number) {
        if (itemsNumber) {
            // remove the first items
            this.stepsHistory.splice(0, itemsNumber);
        } else {
            HistoryManagerStatic._stepsHistory = [];
        }
    }
    get canRestoreOldGameState(): boolean {
        if (HistoryManagerStatic._stepsHistory.length <= 1) {
            return false;
        }
        return HistoryManagerStatic.lastHistoryStep?.diff ? true : false;
    }
    blockRestoreOldGameState() {
        if (this.stepsHistory.length > 1) {
            this.stepsHistory[this.stepsHistory.length - 1] = {
                ...this.stepsHistory[this.stepsHistory.length - 1],
                diff: undefined,
            };
        }
    }
}
