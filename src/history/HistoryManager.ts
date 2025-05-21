import { GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import { diff } from "deep-diff";
import { HistoryChoiceMenuOption, HistoryStep, NarrationHistory } from "../narration";
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
    get stepsInfoMap() {
        return HistoryManagerStatic._stepsInfoHistory;
    }
    get diffMap() {
        return HistoryManagerStatic._diffHistory;
    }
    get narrationMap() {
        return HistoryManagerStatic._narrationHistory;
    }
    get size(): number {
        return HistoryManagerStatic._stepsInfoHistory.size;
    }
    get lastKey(): number | null {
        if (this.size === 0) {
            return null;
        }
        return Math.max(...Array.from(this.keys()));
    }
    keys() {
        return HistoryManagerStatic._stepsInfoHistory.keys();
    }
    get(stepIndex: number): NarrationHistory | undefined {
        const item = HistoryManagerStatic._narrationHistory.get(stepIndex);
        if (item && Object.keys(item).length === 1 && item.stepIndex !== undefined) {
            return undefined;
        }
        return item;
    }
    delete(stepIndex: number) {
        HistoryManagerStatic._stepsInfoHistory.delete(stepIndex);
        HistoryManagerStatic._diffHistory.delete(stepIndex);
        HistoryManagerStatic._narrationHistory.delete(stepIndex);
    }
    private internalRestoreOldGameState(steps: number, restoredStep: GameStepState): GameStepState {
        if (steps <= 0) {
            return restoredStep;
        }
        if (this.size == 0) {
            return restoredStep;
        }
        const lastKey = this.lastKey;
        if (typeof lastKey !== "number") {
            logger.error("You can't go back, there is no step to go back");
            return restoredStep;
        }
        const diff = HistoryManagerStatic._diffHistory.get(lastKey);
        if (diff) {
            try {
                let result = restoreDiffChanges(restoredStep, diff);
                GameUnifier.stepCounter = lastKey;
                this.delete(lastKey);
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
        if (HistoryManagerStatic._diffHistory.size < 1) {
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
        historyInfo: HistoryInfo,
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
        const lastKey = this.lastKey;
        const asyncFunction = async () => {
            try {
                let lastStepHistory: Omit<HistoryStep, "diff"> | undefined = undefined;
                let lastNarrativeHistory: NarrationHistory | undefined = undefined;
                if (typeof lastKey === "number") {
                    lastStepHistory = HistoryManagerStatic._stepsInfoHistory.get(lastKey);
                    lastNarrativeHistory = HistoryManagerStatic._narrationHistory.get(lastKey);
                }

                let data = diff(originalStepData, currentStepData);
                HistoryManagerStatic._stepsInfoHistory.set(historyInfo.index, historyInfo);
                if (data) {
                    HistoryManagerStatic._diffHistory.set(historyInfo.index, data);
                } else {
                    logger.warn("It was not possible to create the difference between the two steps");
                }
                let previousItem = {};
                const narrativeHistory = this.itemMapper(
                    {
                        step: historyInfo,
                    },
                    previousItem
                );
                HistoryManagerStatic._narrationHistory.set(historyInfo.index, narrativeHistory);
                if (lastStepHistory && lastNarrativeHistory && typeof lastKey === "number") {
                    const previousNarrativeHistory = this.itemMapper(
                        {
                            ...previousItem,
                            step: lastStepHistory,
                        },
                        {}
                    );
                    HistoryManagerStatic._narrationHistory.set(lastKey, previousNarrativeHistory);
                }
            } catch (e) {
                logger.error("Error adding history step", e);
            }
        };
        asyncFunction();
        HistoryManagerStatic.originalStepData = currentStepData;
    }
    itemMapper(
        item: {
            step: Omit<HistoryStep, "diff">;
            choiceIndexMade?: number;
            inputValue?: StorageElementType;
            removeDialogue?: boolean;
        },
        previousItem:
            | { choiceIndexMade?: number; inputValue?: StorageElementType; removeDialogue?: boolean }
            | undefined
    ): NarrationHistory {
        const { step, choiceIndexMade, inputValue, removeDialogue } = item;
        let dialogue = step.dialogue || step.dialoge;
        if (previousItem && step.isGlued) {
            previousItem.removeDialogue = true;
        }
        if (removeDialogue) {
            dialogue = undefined;
        }
        let requiredChoices = step.choices;
        if (previousItem && step.currentLabel) {
            if (step.choiceIndexMade !== undefined) {
                previousItem.choiceIndexMade = step.choiceIndexMade;
            }
        }
        if (step.inputValue && previousItem) {
            previousItem.inputValue = step.inputValue;
        }
        if (dialogue || requiredChoices || inputValue) {
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
        return {
            stepIndex: step.index,
        };
    }
    get narrativeHistory(): NarrationHistory[] {
        const result: NarrationHistory[] = [];
        const keys = Array.from(this.keys()).sort((a, b) => a - b);
        keys.forEach((key) => {
            const item = this.get(key);
            if (item) {
                result.push(item);
            }
        });
        return result;
    }
    get latestCurrentLabelHistory(): NarrationHistory[] {
        const result: NarrationHistory[] = [];
        const keys = Array.from(this.keys()).sort((a, b) => b - a);
        const lastKey = keys.shift();
        if (typeof lastKey !== "number") {
            return result;
        }
        const lastItem = HistoryManagerStatic._stepsInfoHistory.get(lastKey);
        if (!lastItem) {
            return result;
        }
        const lastLabel = lastItem.currentLabel;
        let prevIndex = lastItem.index;

        keys.every((key) => {
            const item = this.get(key);
            if (item) {
                const info = HistoryManagerStatic._stepsInfoHistory.get(key);
                if (!info || !(info.currentLabel === lastLabel && info.index <= prevIndex)) {
                    return false;
                }
                result.push(item);
            }
            prevIndex = key;
            return true;
        });

        return result.reverse();
    }
    removeNarrativeHistory(itemsNumber?: number) {
        if (itemsNumber) {
            let keys = Array.from(this.keys()).sort((a, b) => a - b);
            // get the first itemsNumber keys
            keys = keys.slice(0, itemsNumber);
            keys.forEach((key) => {
                HistoryManagerStatic._narrationHistory.delete(key);
                HistoryManagerStatic._stepsInfoHistory.delete(key);
                HistoryManagerStatic._diffHistory.delete(key);
            });
        } else {
            HistoryManagerStatic._stepsInfoHistory.clear();
            HistoryManagerStatic._diffHistory.clear();
            HistoryManagerStatic._narrationHistory.clear();
        }
    }
    get canGoBack(): boolean {
        const lastKey = this.lastKey;
        if (typeof lastKey !== "number") {
            return false;
        }
        return HistoryManagerStatic._diffHistory.has(lastKey);
    }
    blockGoBack() {
        if (GameUnifier.currentStepsRunningNumber !== 0) {
            return;
        }
        HistoryManagerStatic._diffHistory.clear();
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
        HistoryManagerStatic._stepsInfoHistory.clear();
        HistoryManagerStatic._diffHistory.clear();
        HistoryManagerStatic._narrationHistory.clear();
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
        let keys = Array.from(this.keys()).sort((a, b) => a - b);
        // take only last the this.stepLimitSaved steps
        if (keys.length > this.stepLimitSaved) {
            keys = keys.slice(keys.length - this.stepLimitSaved);
        }
        let stepsHistory: HistoryStep[] = [];
        keys.forEach((key) => {
            const step = HistoryManagerStatic._stepsInfoHistory.get(key);
            if (step) {
                let diff = HistoryManagerStatic._diffHistory.get(key);
                stepsHistory.push({
                    ...step,
                    diff: diff,
                });
            }
        });
        return {
            stepsHistory: createExportableElement(stepsHistory),
            originalStepData: createExportableElement(HistoryManagerStatic._originalStepData),
        };
    }
    restoreNarrativeHistory() {
        const keys = Array.from(this.keys()).sort((a, b) => a - b);
        let previousItem: {
            choiceIndexMade?: number;
            inputValue?: StorageElementType;
            removeDialogue?: boolean;
        } = {};

        // Iterate over the stepsHistory array in reverse order
        keys.forEach((key) => {
            const step = HistoryManagerStatic._stepsInfoHistory.get(key);
            if (step) {
                let moreInfo = {
                    ...previousItem,
                };
                previousItem = {};
                let res = this.itemMapper(
                    {
                        step: step,
                        choiceIndexMade: moreInfo.choiceIndexMade,
                        inputValue: moreInfo.inputValue,
                        removeDialogue: moreInfo.removeDialogue,
                    },
                    previousItem
                );
                if (res) {
                    HistoryManagerStatic._narrationHistory.set(key, res);
                }
            }
        });
    }
    public async restore(data: object) {
        this.clear();
        try {
            if (data.hasOwnProperty("stepsHistory")) {
                const stepsHistory = (data as HistoryGameState)["stepsHistory"];
                stepsHistory.forEach((step: HistoryStep) => {
                    if (step.diff) {
                        HistoryManagerStatic._diffHistory.set(step.index, step.diff);
                    }
                    let info = { ...step, diff: undefined };
                    HistoryManagerStatic._stepsInfoHistory.set(step.index, info);
                });
                this.restoreNarrativeHistory();
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
