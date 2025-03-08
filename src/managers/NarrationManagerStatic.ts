import { storage } from ".";
import { Label } from "../classes";
import { getLabelById } from "../decorators/label-decorator";
import HistoryStep, { HistoryStepData } from "../interface/HistoryStep";
import OpenedLabel from "../interface/OpenedLabel";
import ChoicesMadeType from "../types/ChoicesMadeType";
import { LabelIdType } from "../types/LabelIdType";
import { restoreDiffChanges } from "../utils/diff-utility";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";

type AllOpenedLabelsType = { [key: LabelIdType]: { biggestStep: number; openCount: number } };

type CurrentStepTimesCounterMemotyData = {
    lastStepIndexs?: number[];
    usedRandomNumbers?: { [minmaxkey: string]: number[] };
    stepSha1: string;
};
type CurrentStepTimesCounterMemoty = {
    [key: LabelIdType]: {
        [key: string]: CurrentStepTimesCounterMemotyData;
    };
};

export default class NarrationManagerStatic {
    private constructor() {}
    static _stepsHistory: HistoryStep[] = [];
    /**
     * Number of steps function that are running.
     * If you run a step that have a goNext, this number is > 1.
     */
    static stepsRunning: number = 0;
    /**
     * Number of requests to go to the next step.
     * If it is > 0, after the stepsRunning is 0, the next step will be executed
     */
    static goNextRequests: number = 0;
    static cleanSteps: boolean = false;
    static choiseMadeTemp: undefined | number = undefined;
    static stepLimitSaved: number = 20;
    /**
     * is a list of all labels that have been opened during the progression of the steps.
     * the key is the label id and the biggest step opened.
     */
    static get allOpenedLabels() {
        return storage.getVariable<AllOpenedLabelsType>(storage.keysSystem.OPENED_LABELS_COUNTER_KEY) || {};
    }
    static set allOpenedLabels(value: AllOpenedLabelsType) {
        storage.setVariable(storage.keysSystem.OPENED_LABELS_COUNTER_KEY, value);
    }
    static getCurrentStepTimesCounterData(nestedId: string = ""): CurrentStepTimesCounterMemotyData | null {
        let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        if (currentLabelStepIndex === null) {
            logger.error("currentLabelStepIndex is null");
            return null;
        }
        let currentLabelStepIndexId = `${currentLabelStepIndex}${nestedId}`;
        let labelId = NarrationManagerStatic.currentLabelId;
        let currentLabel = NarrationManagerStatic._currentLabel;
        if (!labelId || currentLabelStepIndex === null || !currentLabel) {
            logger.error("currentLabelId or currentLabelStepIndex is null or currentLabel not found");
            return null;
        }
        let stepSha1 = currentLabel.getStepSha1(currentLabelStepIndex) || "error";
        let obj =
            storage.getVariable<CurrentStepTimesCounterMemoty>(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        if (!obj[labelId][currentLabelStepIndexId] || obj[labelId][currentLabelStepIndexId].stepSha1 != stepSha1) {
            obj[labelId][currentLabelStepIndexId] = { stepSha1: stepSha1 };
        }
        return obj[labelId][currentLabelStepIndexId];
    }
    private static setCurrentStepTimesCounterData(nestedId: string = "", data: CurrentStepTimesCounterMemotyData) {
        let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        let currentLabelStepIndexId = currentLabelStepIndex + nestedId;
        let labelId = NarrationManagerStatic.currentLabelId;
        if (!labelId || currentLabelStepIndex === null) {
            logger.error("currentLabelId or currentLabelStepIndex is null");
            return;
        }
        let obj =
            storage.getVariable<CurrentStepTimesCounterMemoty>(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        obj[labelId][currentLabelStepIndexId] = data;
        storage.setVariable(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY, obj);
    }
    static getCurrentStepTimesCounter(nestedId: string = ""): number {
        let lastStep = NarrationManagerStatic._lastStepIndex;
        let obj = NarrationManagerStatic.getCurrentStepTimesCounterData(nestedId);
        if (!obj) {
            logger.error("getCurrentStepTimesCounter obj is null");
            return 0;
        }
        let list = obj.lastStepIndexs || [];
        let listContainLastStep = list.find((item) => item === lastStep);
        if (!listContainLastStep) {
            list.push(lastStep);
            obj.lastStepIndexs = list;
            NarrationManagerStatic.setCurrentStepTimesCounterData(nestedId, obj);
        }
        return list.length;
    }
    static getRandomNumber(
        min: number,
        max: number,
        options: {
            onceOnly?: boolean;
            nestedId?: string;
        } = {}
    ): number | undefined {
        let nestedId = options.nestedId || "";
        let onceonly = options.onceOnly || false;
        if (onceonly) {
            let obj = NarrationManagerStatic.getCurrentStepTimesCounterData(nestedId);
            if (!obj) {
                return undefined;
            }
            let usedRandomNumbers = obj.usedRandomNumbers || {};
            // get a random number between min and max and not in the usedRandomNumbers, if all numbers are in the usedRandomNumbers, return null
            let allNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min).filter(
                (item) => !usedRandomNumbers[`${min}-${max}`]?.includes(item)
            );
            if (allNumbers.length === 0) {
                return undefined;
            }
            let randomIndex = Math.floor(Math.random() * allNumbers.length);
            let randomNumber = allNumbers[randomIndex];
            if (!usedRandomNumbers[`${min}-${max}`]) {
                usedRandomNumbers[`${min}-${max}`] = [];
            }
            usedRandomNumbers[`${min}-${max}`].push(randomNumber);
            obj.usedRandomNumbers = usedRandomNumbers;
            NarrationManagerStatic.setCurrentStepTimesCounterData(nestedId, obj);
            return randomNumber;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static resetCurrentStepTimesCounter(nestedId: string = "") {
        let currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        let currentLabelStepIndexId = currentLabelStepIndex + nestedId;
        let labelId = NarrationManagerStatic.currentLabelId;
        if (!labelId || currentLabelStepIndex === null) {
            logger.error("currentLabelId or currentLabelStepIndex is null");
            return;
        }
        let obj =
            storage.getVariable<CurrentStepTimesCounterMemoty>(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        obj[labelId][currentLabelStepIndexId] = { lastStepIndexs: [], stepSha1: "" };
        storage.setVariable(storage.keysSystem.CURRENT_STEP_TIMES_COUNTER_KEY, obj);
    }
    /**
     * is a list of all choices made by the player during the progression of the steps.
     */
    static get allChoicesMade() {
        return storage.getVariable<ChoicesMadeType[]>(storage.keysSystem.ALL_CHOICES_MADE_KEY) || [];
    }
    static set allChoicesMade(value: ChoicesMadeType[]) {
        storage.setVariable(storage.keysSystem.ALL_CHOICES_MADE_KEY, value);
    }
    static _lastStepIndex: number = 0;
    /**
     * Increase the last step index that occurred during the progression of the steps.
     */
    static increaseLastStepIndex() {
        NarrationManagerStatic._lastStepIndex++;
    }
    static _openedLabels: OpenedLabel[] = [];
    static get _currentLabel(): Label | undefined {
        if (NarrationManagerStatic.currentLabelId) {
            return getLabelById(NarrationManagerStatic.currentLabelId);
        }
    }
    /**
     * currentLabelId is the current label id that occurred during the progression of the steps.
     */
    static get currentLabelId(): LabelIdType | undefined {
        if (NarrationManagerStatic._openedLabels.length > 0) {
            let item = NarrationManagerStatic._openedLabels[NarrationManagerStatic._openedLabels.length - 1];
            return item.label;
        }
        return undefined;
    }
    static get currentLabelStepIndex(): number | null {
        if (NarrationManagerStatic._openedLabels.length > 0) {
            let item = NarrationManagerStatic._openedLabels[NarrationManagerStatic._openedLabels.length - 1];
            return item.currentStepIndex;
        }
        return null;
    }
    /**
     * lastHistoryStep is the last history step that occurred during the progression of the steps.
     */
    static get lastHistoryStep(): HistoryStep | null {
        if (NarrationManagerStatic._stepsHistory.length > 0) {
            return NarrationManagerStatic._stepsHistory[NarrationManagerStatic._stepsHistory.length - 1];
        }
        return null;
    }
    static _originalStepData: HistoryStepData | undefined = undefined;
    static get originalStepData(): HistoryStepData {
        if (!NarrationManagerStatic._originalStepData) {
            return {
                path: "",
                storage: {},
                canvas: {
                    elementAliasesOrder: [],
                    elements: {},
                    stage: {},
                    tickers: {},
                    tickersSteps: {},
                    tickersOnPause: {},
                    tickersToCompleteOnStepEnd: { tikersIds: [], stepAlias: [] },
                },
                sound: {
                    soundAliasesOrder: [],
                    soundsPlaying: {},
                    playInStepIndex: {},
                    filters: undefined,
                },
                labelIndex: -1,
                openedLabels: [],
            };
        }
        return createExportableElement(NarrationManagerStatic._originalStepData);
    }
    static set originalStepData(value: HistoryStepData) {
        NarrationManagerStatic._originalStepData = createExportableElement(value);
    }

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     * @param stepIndex The step index of the label.
     * @param choiseMade The index of the choise made by the player. (This params is used in the choice menu)
     */
    static addLabelHistory(label: LabelIdType, stepIndex: number) {
        let allOpenedLabels = NarrationManagerStatic.allOpenedLabels;
        let oldStepIndex = NarrationManagerStatic.allOpenedLabels[label]?.biggestStep || 0;
        let openCount = NarrationManagerStatic.allOpenedLabels[label]?.openCount || 0;
        if (!oldStepIndex || oldStepIndex < stepIndex) {
            allOpenedLabels[label] = { biggestStep: stepIndex, openCount: openCount };
            NarrationManagerStatic.allOpenedLabels = allOpenedLabels;
        }
    }
    static addChoicesMade(label: LabelIdType, stepIndex: number, stepSha: string, choiseMade: number) {
        let allChoicesMade = NarrationManagerStatic.allChoicesMade;
        let alredyMade = allChoicesMade.findIndex(
            (item) =>
                item.labelId === label &&
                item.stepIndex === stepIndex &&
                item.choiceIndex === choiseMade &&
                item.stepSha1 === stepSha
        );
        if (alredyMade < 0) {
            allChoicesMade.push({
                labelId: label,
                stepIndex: stepIndex,
                choiceIndex: choiseMade,
                stepSha1: stepSha,
                madeTimes: 1,
            });
        } else {
            allChoicesMade[alredyMade].madeTimes++;
        }
        NarrationManagerStatic.allChoicesMade = allChoicesMade;
    }
    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     */
    static pushNewLabel(label: LabelIdType) {
        let currentLabel = getLabelById(label);
        if (!currentLabel) {
            throw new Error(`[Pixi’VN] Label ${label} not found`);
        }
        NarrationManagerStatic._openedLabels.push({
            label: label,
            currentStepIndex: 0,
        });
        let allOpenedLabels = NarrationManagerStatic.allOpenedLabels;
        let biggestStep = NarrationManagerStatic.allOpenedLabels[label]?.biggestStep || 0;
        let openCount = NarrationManagerStatic.allOpenedLabels[label]?.openCount || 0;
        allOpenedLabels[label] = { biggestStep: biggestStep, openCount: openCount + 1 };
        NarrationManagerStatic.allOpenedLabels = allOpenedLabels;
    }
    /**
     * Increase the current step index of the current label.
     */
    static increaseCurrentStepIndex() {
        if (NarrationManagerStatic._openedLabels.length > 0) {
            let item = NarrationManagerStatic._openedLabels[NarrationManagerStatic._openedLabels.length - 1];
            NarrationManagerStatic._openedLabels[NarrationManagerStatic._openedLabels.length - 1] = {
                ...item,
                currentStepIndex: item.currentStepIndex + 1,
            };
        }
    }
    static restoreLastLabelList() {
        NarrationManagerStatic._openedLabels = NarrationManagerStatic.originalStepData.openedLabels;
    }

    /* Run Methods */

    /* Go Back & Refresh Methods */

    static goBackInternal(steps: number, restoredStep: HistoryStepData): HistoryStepData {
        if (steps <= 0) {
            return restoredStep;
        }
        if (NarrationManagerStatic._stepsHistory.length == 0) {
            return restoredStep;
        }
        let lastHistoryStep = NarrationManagerStatic.lastHistoryStep;
        if (lastHistoryStep?.diff) {
            try {
                let result = restoreDiffChanges(restoredStep, lastHistoryStep.diff);
                NarrationManagerStatic._lastStepIndex = lastHistoryStep.index;
                NarrationManagerStatic._stepsHistory.pop();
                return NarrationManagerStatic.goBackInternal(steps - 1, result);
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
