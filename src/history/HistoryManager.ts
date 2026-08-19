import type { GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import { GameUnifier } from "@drincs/pixi-vn/core";
import type {
    HistoryChoiceMenuOption,
    HistoryStep,
    NarrationHistory,
    StepLabelPropsType,
} from "@drincs/pixi-vn/narration";
import type { StorageElementType } from "@drincs/pixi-vn/storage";
import HistoryManagerStatic, { type HistoryGoBackModeType } from "@history/HistoryManagerStatic";
import type HistoryGameState from "@history/interfaces/HistoryGameState";
import type HistoryManagerInterface from "@history/interfaces/HistoryManagerInterface";
import { restoreDiffChanges } from "@utils/diff-utility";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";
import diff from "microdiff";

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
        // Avoid Math.max(...keys): spreading every key taken this session into a single call
        // both grows in cost with playthrough length and can blow the call stack on long ones.
        let max: number | null = null;
        for (const key of this.keys()) {
            if (max === null || key > max) {
                max = key;
            }
        }
        return max;
    }
    /** The most recent key that actually has a diff recorded - in "step" mode this is
     * always the same as {@link lastKey}, but in "paragraph" mode most steps don't get
     * a diff of their own, so this is what `back()` actually needs to jump to. */
    private get lastDiffKey(): number | null {
        let max: number | null = null;
        for (const key of HistoryManagerStatic._diffHistory.keys()) {
            if (max === null || key > max) {
                max = key;
            }
        }
        return max;
    }
    get goBackMode(): HistoryGoBackModeType {
        return HistoryManagerStatic.goBackMode;
    }
    set goBackMode(mode: HistoryGoBackModeType) {
        HistoryManagerStatic.goBackMode = mode;
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
    /** Deletes every recorded key from `fromKey` onward - in "paragraph" mode, jumping
     * back to a checkpoint also invalidates every non-checkpoint step recorded after it. */
    private deleteFromKeyOnward(fromKey: number) {
        Array.from(this.keys())
            .filter((key) => key >= fromKey)
            .forEach((key) => {
                this.delete(key);
            });
    }
    /** The key of the checkpoint immediately before `beforeKey` - i.e. the diff boundary
     * that the restored state actually lands on. In "step" mode this is always
     * `beforeKey - 1` (every step is its own checkpoint); in "paragraph" mode a checkpoint's
     * diff can span several merged steps, so the restored state's true step count is this
     * boundary, not `beforeKey` itself. Falls back to 0 (index 0 is always an implicit
     * checkpoint, but never stored in `_diffHistory`) when there's no earlier one. */
    private previousCheckpointKey(beforeKey: number): number {
        let max = 0;
        for (const key of HistoryManagerStatic._diffHistory.keys()) {
            if (key < beforeKey && key > max) {
                max = key;
            }
        }
        return max;
    }
    private getOldGameState(steps: number, restoredStep: GameStepState): GameStepState {
        if (steps <= 0) {
            return restoredStep;
        }
        if (this.size === 0) {
            return restoredStep;
        }
        // In "step" mode this is always the same as lastKey; in "paragraph" mode most
        // steps have no diff of their own, so this finds the checkpoint to jump to.
        const targetKey = this.lastDiffKey;
        if (typeof targetKey !== "number") {
            logger.warn("You can't go back, there is no step to go back");
            return restoredStep;
        }
        const diff = HistoryManagerStatic._diffHistory.get(targetKey);
        if (diff) {
            try {
                const result = restoreDiffChanges(restoredStep, diff);
                // The diff at `targetKey` undoes everything merged into it since the
                // PREVIOUS checkpoint - so that previous checkpoint's key (+1), not
                // `targetKey` itself, is both the restored state's true step count and
                // where every now-invalidated step (merged or not) needs deleting from.
                const fromKey = this.previousCheckpointKey(targetKey) + 1;
                GameUnifier.stepCounter = fromKey;
                this.deleteFromKeyOnward(fromKey);
                return this.getOldGameState(steps - 1, result);
            } catch (e) {
                logger.error("Error applying diff", e);
                return restoredStep;
            }
        } else {
            logger.warn("No diff found for the last step, cannot go back");
            return restoredStep;
        }
    }
    public async back(props: StepLabelPropsType, options: { steps?: number } = {}) {
        const { steps = 1 } = options;
        if (!Number.isFinite(steps)) {
            logger.warn(
                `[back] The parameter steps must be a valid finite number, received: ${steps}`,
            );
            return;
        }
        if (steps <= 0) {
            logger.warn(`[back] The parameter steps must be greater than 0, received: ${steps}`);
            return;
        }
        if (GameUnifier.runningStepsCount > 0) {
            GameUnifier.increaseBackRequest(steps);
            return;
        }
        if (HistoryManagerStatic._diffHistory.size < 1) {
            logger.warn("You can't go back, there is no step to go back");
            return;
        }
        GameUnifier.runningStepsCount++;
        try {
            const restoredStep = createExportableElement(
                this.getOldGameState(steps, HistoryManagerStatic.originalStepData),
            );
            if (restoredStep) {
                await GameUnifier.restoreGameStepState(restoredStep, GameUnifier.navigate);
                const stepCounter = GameUnifier.stepCounter - 1;
                const item = HistoryManagerStatic._narrationHistory.get(stepCounter);
                if (item && Object.keys(item).length === 1 && item.stepIndex !== undefined) {
                    const historyInfo = HistoryManagerStatic._stepsInfoHistory.get(stepCounter);
                    if (historyInfo) {
                        const narrativeHistory = this.itemMapper({
                            step: historyInfo,
                        });
                        HistoryManagerStatic._narrationHistory.set(
                            historyInfo.index,
                            narrativeHistory,
                        );
                    }
                }
            } else {
                logger.error("Error going back");
            }
            HistoryManagerStatic.originalStepData = restoredStep;
        } catch (e) {
            logger.error("Error going back", e);
        }
        GameUnifier.runningStepsCount--;
        if (GameUnifier.runningStepsCount === 0 && GameUnifier.backRequestsCount !== 0) {
            return await GameUnifier.processNavigationRequests(props);
        }
    }
    /**
     * Whether this step should get its own go-back diff. In "step" mode every step
     * does; in "paragraph" mode only a new paragraph (the opened-labels stack changed
     * vs the previous step - either its depth, or which label sits at any level of it),
     * a proposed choice, or a requested input counts - everything else is merged into
     * the diff of the next step that does qualify.
     *
     * Comparing only the stack's LENGTH (as this used to) misses a `jump`: it replaces
     * the top label instead of pushing a new frame, so the stack depth stays the same
     * even though the player has moved into an entirely different label. That silently
     * merged the jump target's steps into the SAME paragraph as whatever step triggered
     * the jump (most commonly a choice) - so going back from inside the jumped-to label
     * skipped past it entirely, landing at the paragraph before the choice instead of at
     * the choice itself.
     */
    private isCheckpointStep(
        historyInfo: HistoryInfo,
        lastStepHistory: Omit<HistoryStep, "diff"> | undefined,
    ): boolean {
        if (HistoryManagerStatic.goBackMode === "step") {
            return true;
        }
        if (historyInfo.choices && historyInfo.choices.length > 0) {
            return true;
        }
        if (historyInfo.isRequiredInput) {
            return true;
        }
        const currentLabels = historyInfo.openedLabels ?? [];
        const lastLabels = lastStepHistory?.openedLabels ?? [];
        if (currentLabels.length !== lastLabels.length) {
            return true;
        }
        return currentLabels.some((opened, i) => opened.label !== lastLabels[i]?.label);
    }
    add(
        historyInfo: HistoryInfo,
        options: {
            ignoreSameStep?: boolean;
        } = {},
    ) {
        const originalStepData = HistoryManagerStatic.originalStepData;
        const { ignoreSameStep } = options;
        const currentStepData: GameStepState = GameUnifier.currentGameStepState;
        if (!ignoreSameStep && this.isSameStep(originalStepData, currentStepData)) {
            return;
        }
        const lastKey = this.lastKey;
        const lastStepHistory =
            typeof lastKey === "number"
                ? HistoryManagerStatic._stepsInfoHistory.get(lastKey)
                : undefined;
        // historyInfo.index === 0 has nothing to diff against yet, but is otherwise
        // always treated as a checkpoint (there's no earlier step to merge it into).
        const isCheckpoint =
            historyInfo.index === 0 || this.isCheckpointStep(historyInfo, lastStepHistory);
        const asyncFunction = async () => {
            try {
                const lastNarrativeHistory =
                    typeof lastKey === "number"
                        ? HistoryManagerStatic._narrationHistory.get(lastKey)
                        : undefined;

                HistoryManagerStatic._stepsInfoHistory.set(historyInfo.index, historyInfo);
                if (historyInfo.index !== 0 && isCheckpoint) {
                    const data = diff(originalStepData, currentStepData);
                    if (data) {
                        HistoryManagerStatic._diffHistory.set(historyInfo.index, data);
                    } else {
                        logger.warn(
                            "It was not possible to create the difference between the two steps",
                        );
                    }
                }
                const previousItem = {};
                const narrativeHistory = this.itemMapper(
                    {
                        step: historyInfo,
                    },
                    previousItem,
                );
                HistoryManagerStatic._narrationHistory.set(historyInfo.index, narrativeHistory);
                if (lastStepHistory && lastNarrativeHistory && typeof lastKey === "number") {
                    const previousNarrativeHistory = this.itemMapper(
                        {
                            ...previousItem,
                            step: lastStepHistory,
                        },
                        {},
                    );
                    HistoryManagerStatic._narrationHistory.set(lastKey, previousNarrativeHistory);
                }
            } catch (e) {
                logger.error("Error adding history step", e);
            }
        };
        asyncFunction();
        // Only move the diffing baseline forward at a checkpoint - a skipped step's
        // changes stay pending against the last checkpoint's baseline, so the next
        // checkpoint's diff naturally captures everything accumulated since then.
        if (historyInfo.index === 0 || isCheckpoint) {
            HistoryManagerStatic.originalStepData = currentStepData;
        }
    }
    itemMapper(
        item: {
            step: Omit<HistoryStep, "diff">;
            choiceIndexMade?: number;
            inputValue?: StorageElementType;
            removeDialogue?: boolean;
        },
        previousItem?: {
            choiceIndexMade?: number;
            inputValue?: StorageElementType;
            removeDialogue?: boolean;
        },
    ): NarrationHistory {
        const { step, choiceIndexMade, inputValue, removeDialogue } = item;
        let dialogue = step.dialogue;
        if (previousItem && step.isGlued) {
            previousItem.removeDialogue = true;
        }
        if (removeDialogue) {
            dialogue = undefined;
        }
        const requiredChoices = step.choices;
        if (previousItem && step.currentLabel) {
            if (step.choiceIndexMade !== undefined) {
                previousItem.choiceIndexMade = step.choiceIndexMade;
            }
        }
        if (step.inputValue && previousItem) {
            previousItem.inputValue = step.inputValue;
        }
        if (dialogue || requiredChoices || inputValue) {
            const choices: HistoryChoiceMenuOption[] | undefined = requiredChoices?.map(
                (choice, index) => {
                    let hidden: boolean = false;
                    if (choice.oneTime && step.alreadyMadeChoices?.includes(index)) {
                        hidden = true;
                    }
                    return {
                        text: choice.text,
                        type: choice.type,
                        isResponse: false,
                        hidden: hidden,
                    };
                },
            );
            if (choices) {
                // if all choices are hidden find onlyHaveNoChoice
                if (choices.every((choice) => choice.hidden)) {
                    const onlyHaveNoChoice = choices.find((choice) => choice.hidden === false);
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
                openedLabelsNumber: step.openedLabels?.length,
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
    get currentLabelHistory(): NarrationHistory[] {
        const result: NarrationHistory[] = [];
        const keys = Array.from(this.keys()).sort((a, b) => b - a);
        if (keys.length === 0) {
            return result;
        }
        const lastKey = keys[0];
        if (typeof lastKey !== "number") {
            return result;
        }
        const lastItem = HistoryManagerStatic._stepsInfoHistory.get(lastKey);
        if (!lastItem) {
            return result;
        }
        const openedLabels = lastItem.openedLabels;
        if (!openedLabels || !Array.isArray(openedLabels) || openedLabels.length === 0) {
            return result;
        }
        let currentStepIndex = openedLabels[0].currentStepIndex;
        const label = openedLabels[0].label;

        keys.every((key, index) => {
            const item = this.get(key);
            if (item) {
                if (index === 0) {
                    result.push(item);
                    return true;
                }
                const info = HistoryManagerStatic._stepsInfoHistory.get(key);
                if (!info) {
                    return true;
                }
                const openedLabelsTemp = info.openedLabels;
                if (
                    !openedLabelsTemp ||
                    !Array.isArray(openedLabelsTemp) ||
                    openedLabelsTemp.length === 0
                ) {
                    return false;
                }
                if (
                    openedLabelsTemp[0].label !== label ||
                    openedLabelsTemp[0].currentStepIndex > currentStepIndex
                ) {
                    return false;
                }
                currentStepIndex = openedLabelsTemp[0].currentStepIndex;
                result.push(item);
            }
            return true;
        });

        return result.reverse();
    }
    get currentPageParagraphs(): NarrationHistory[][] {
        const paragraphs: NarrationHistory[][] = [];
        let lastOpenedLabelsNumber: number | undefined;
        this.currentLabelHistory.forEach((item) => {
            if (paragraphs.length === 0 || item.openedLabelsNumber !== lastOpenedLabelsNumber) {
                paragraphs.push([item]);
            } else {
                paragraphs[paragraphs.length - 1].push(item);
            }
            lastOpenedLabelsNumber = item.openedLabelsNumber;
        });
        return paragraphs;
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
        // In "step" mode the most recent step always has its own diff, so this is
        // equivalent to checking lastKey specifically; in "paragraph" mode most steps
        // don't, so we just need at least one checkpoint recorded anywhere to go back to.
        return HistoryManagerStatic._diffHistory.size > 0;
    }
    blockGoBack() {
        if (GameUnifier.runningStepsCount !== 0) {
            return;
        }
        HistoryManagerStatic._diffHistory.clear();
    }

    private isSameStep(originalState: GameStepState, newState: GameStepState) {
        if (originalState.openedLabels.length === newState.openedLabels.length) {
            try {
                const lastStepDataOpenedLabelsString = JSON.stringify(originalState.openedLabels);
                const historyStepOpenedLabelsString = JSON.stringify(newState.openedLabels);
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
        const stepsHistory: HistoryStep[] = [];
        keys.forEach((key) => {
            const step = HistoryManagerStatic._stepsInfoHistory.get(key);
            if (step) {
                const diff = HistoryManagerStatic._diffHistory.get(key);
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
                const moreInfo = {
                    ...previousItem,
                };
                previousItem = {};
                const res = this.itemMapper(
                    {
                        step: step,
                        choiceIndexMade: moreInfo.choiceIndexMade,
                        inputValue: moreInfo.inputValue,
                        removeDialogue: moreInfo.removeDialogue,
                    },
                    previousItem,
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
            if (Object.hasOwn(data, "stepsHistory")) {
                const stepsHistory = (data as HistoryGameState).stepsHistory;
                stepsHistory.forEach((step: HistoryStep) => {
                    if (step.diff) {
                        HistoryManagerStatic._diffHistory.set(step.index, step.diff);
                    }
                    const info = { ...step, diff: undefined };
                    HistoryManagerStatic._stepsInfoHistory.set(step.index, info);
                });
                this.restoreNarrativeHistory();
            } else {
                logger.warn("Could not import stepsHistory data, so will be ignored");
            }
            if (Object.hasOwn(data, "originalStepData")) {
                HistoryManagerStatic._originalStepData = (
                    data as HistoryGameState
                ).originalStepData;
            } else {
                logger.warn("Could not import originalStepData data, so will be ignored");
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
