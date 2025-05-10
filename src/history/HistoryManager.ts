import { GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import { diff } from "deep-diff";
import { HistoryChoiceMenuOption, HistoryStep, NarrativeHistory } from "../narration";
import { StorageElementType } from "../storage/types/StorageElementType";
import GameUnifier from "../unifier";
import { createExportableElement } from "../utils";
import { restoreDiffChanges } from "../utils/diff-utility";
import { logger } from "../utils/log-utility";
import HistoryManagerStatic from "./HistoryManagerStatic";
import HistoryGameState from "./interfaces/HistoryGameState";
import HistoryManagerInterface from "./interfaces/HistoryManagerInterface";

/**
 * This class is a class that manages the steps and labels of the game.
 */
export default class HistoryManager implements HistoryManagerInterface {
    get stepsHistory() {
        return HistoryManagerStatic._stepsHistory;
    }
    private internalRestoreOldGameState(steps: number, restoredStep: GameStepState): GameStepState {
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
                return this.internalRestoreOldGameState(steps - 1, result);
            } catch (e) {
                logger.error("Error applying diff", e);
                return restoredStep;
            }
        } else {
            logger.error("You can't go back, there is no step to go back");
            return restoredStep;
        }
    }
    async goBack(navigate: (path: string) => void | Promise<void>, steps: number = 1) {
        if (steps <= 0) {
            logger.warn("The parameter steps must be greater than 0");
            return;
        }
        if (this.stepsHistory.length <= 1) {
            logger.warn("You can't go back, there is no step to go back");
            return;
        }
        if (HistoryManagerStatic.goBackRunning) {
            logger.warn("Go back is already running");
            return;
        }
        HistoryManagerStatic.goBackRunning = true;
        try {
            let restoredStep = createExportableElement(
                this.internalRestoreOldGameState(steps, HistoryManagerStatic.originalStepData)
            );
            if (restoredStep) {
                await GameUnifier.restoreGameStepState(restoredStep, navigate);
            } else {
                logger.error("Error going back");
            }
            HistoryManagerStatic.goBackRunning = false;
        } catch (e) {
            logger.error("Error going back", e);
            HistoryManagerStatic.goBackRunning = false;
        }
    }
    add(
        historyInfo: HistoryInfo = {},
        options: {
            ignoreSameStep?: boolean;
        } = {}
    ) {
        const originalStepData = HistoryManagerStatic.originalStepData;
        const { ignoreSameStep } = options;
        const currentStepData: GameStepState = GameUnifier.currentGameStepState;
        if (!ignoreSameStep && this.isSameStep(originalStepData, currentStepData)) {
            return;
        }
        this.stepsHistory.push({} as any);
        let index = this.stepsHistory.length - 1;
        const asyncFunction = async () => {
            try {
                let data = diff(originalStepData, currentStepData);
                this.stepsHistory[index] = {
                    ...(historyInfo as Omit<HistoryStep, "diff">),
                    diff: data,
                };
            } catch (e) {
                logger.error("Error adding history step", e);
            }
        };
        asyncFunction();
        HistoryManagerStatic.originalStepData = currentStepData;
    }
    historyStepMapper(
        item: { step: HistoryStep; choiceIndexMade?: number; inputValue?: StorageElementType },
        previousItem: { choiceIndexMade?: number; inputValue?: StorageElementType } | undefined
    ): NarrativeHistory | undefined {
        const { step, choiceIndexMade, inputValue } = item;
        let dialogue = step.dialogue || step.dialoge;
        let requiredChoices = step.choices;
        if (previousItem && step.currentLabel) {
            if (step.choiceIndexMade !== undefined) {
                previousItem.choiceIndexMade = step.choiceIndexMade;
            }
        }
        if (step.inputValue && previousItem) {
            previousItem.inputValue = step.inputValue;
        }
        if (dialogue || requiredChoices) {
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
            if (choices) {
                // if all choices are hidden find onlyHaveNoChoice
                if (choices.every((choice) => choice.hidden)) {
                    let onlyHaveNoChoice = choices.find((choice) => choice.hidden === false);
                    if (onlyHaveNoChoice) {
                        onlyHaveNoChoice.hidden = false;
                    }
                }
                if (choiceIndexMade !== undefined) {
                    choices[choiceIndexMade].isResponse = true;
                }
            }
            return {
                dialogue: dialogue
                    ? {
                          ...dialogue,
                          character: dialogue.character
                              ? GameUnifier.getCharacter(dialogue.character) || dialogue.character
                              : undefined,
                      }
                    : undefined,
                playerMadeChoice: typeof choiceIndexMade === "number",
                choices: choices,
                stepIndex: step.index,
                inputValue: inputValue,
            };
        }
    }
    private mapStepToNarrativeHistory(
        step: HistoryStep,
        previousItem: { choiceIndexMade?: number; inputValue?: StorageElementType }
    ): NarrativeHistory | undefined {
        return this.historyStepMapper(
            {
                step,
                choiceIndexMade: previousItem.choiceIndexMade,
                inputValue: previousItem.inputValue,
            },
            previousItem
        );
    }
    get narrativeHistory(): NarrativeHistory[] {
        const result: NarrativeHistory[] = [];
        let previousItem: {
            choiceIndexMade?: number;
            inputValue?: StorageElementType;
        } = {};

        // Iterate over the stepsHistory array in reverse order
        for (let i = this.stepsHistory.length - 1; i >= 0; i--) {
            const step = this.stepsHistory[i];
            let moreInfo = {
                ...previousItem,
            };
            previousItem = {
                choiceIndexMade: undefined,
                inputValue: undefined,
            };
            let res = this.historyStepMapper(
                {
                    step: step,
                    choiceIndexMade: moreInfo.choiceIndexMade,
                    inputValue: moreInfo.inputValue,
                },
                previousItem
            );
            if (res) {
                result.push(res);
            }
        }

        return result.reverse();
    }
    removeNarrativeHistory(itemsNumber?: number) {
        if (itemsNumber) {
            // remove the first items
            this.stepsHistory.splice(0, itemsNumber);
        } else {
            HistoryManagerStatic._stepsHistory = [];
        }
    }
    get canGoBack(): boolean {
        if (HistoryManagerStatic._stepsHistory.length <= 1) {
            return false;
        }
        return HistoryManagerStatic.lastHistoryStep?.diff ? true : false;
    }
    blockGoBack() {
        if (GameUnifier.currentStepsRunningNumber !== 0) {
            return;
        }
        if (this.stepsHistory.length > 1) {
            this.stepsHistory[this.stepsHistory.length - 1] = {
                ...this.stepsHistory[this.stepsHistory.length - 1],
                diff: undefined,
            };
        }
    }

    private isSameStep(originalState: GameStepState, newState: GameStepState) {
        if (originalState.openedLabels.length === newState.openedLabels.length) {
            try {
                let lastStepDataOpenedLabelsString = JSON.stringify(originalState.openedLabels);
                let historyStepOpenedLabelsString = JSON.stringify(newState.openedLabels);
                if (
                    lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                    originalState.path === newState.path &&
                    originalState.labelIndex === newState.labelIndex
                ) {
                    return true;
                }
            } catch (e) {
                logger.error("Error comparing opened labels", e);
                return true;
            }
        }
        return false;
    }

    public clear() {
        HistoryManagerStatic._stepsHistory = [];
        HistoryManagerStatic._originalStepData = undefined;
    }

    get stepLimitSaved() {
        return HistoryManagerStatic.stepLimitSaved;
    }
    set stepLimitSaved(limit: number) {
        HistoryManagerStatic.stepLimitSaved = limit;
    }

    /* Export and Import Methods */

    public export(): HistoryGameState {
        let firstStepToCompres = this.stepsHistory.length - this.stepLimitSaved;
        let stepsHistory: HistoryStep[] = this.stepsHistory.map((step, index) => ({
            diff: firstStepToCompres > index ? undefined : step.diff,
            ...step,
        }));
        return {
            stepsHistory: createExportableElement(stepsHistory),
            originalStepData: createExportableElement(HistoryManagerStatic._originalStepData),
        };
    }
    public async restore(data: object) {
        this.clear();
        try {
            if (data.hasOwnProperty("stepsHistory")) {
                HistoryManagerStatic._stepsHistory = (data as HistoryGameState)["stepsHistory"];
            } else {
                logger.warn("Could not import stepsHistory data, so will be ignored");
            }
            if (data.hasOwnProperty("originalStepData")) {
                HistoryManagerStatic._originalStepData = (data as HistoryGameState)["originalStepData"];
            } else {
                logger.warn("Could not import originalStepData data, so will be ignored");
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
