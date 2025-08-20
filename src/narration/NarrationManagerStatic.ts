import { GameUnifier } from "@drincs/pixi-vn/unifier";
import { LabelAbstract } from ".";
import { SYSTEM_RESERVED_STORAGE_KEYS } from "../storage/constants";
import { createExportableElement } from "../utils";
import { logger } from "../utils/log-utility";
import Label from "./classes/Label";
import RegisteredLabels from "./decorators/RegisteredLabels";
import HistoryStep from "./interfaces/HistoryStep";
import OpenedLabel from "./interfaces/OpenedLabel";
import ChoicesMadeType from "./types/ChoicesMadeType";
import { LabelIdType } from "./types/LabelIdType";

type AllOpenedLabelsType = { [key: LabelIdType]: { biggestStep: number; openCount: number } };

type CurrentStepTimesCounterMemotyData = {
    /**
     * @deprecated use stepIndexs
     */
    lastStepIndexs?: number[];
    stepCounters?: number[];
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
    static choiceMadeTemp: undefined | number = undefined;
    static lastHistoryStep: Omit<HistoryStep, "diff"> | null = null;
    /**
     * is a list of all labels that have been opened during the progression of the steps.
     * the key is the label id and the biggest step opened.
     */
    static get allOpenedLabels() {
        return (
            GameUnifier.getVariable<AllOpenedLabelsType>(SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY) || {}
        );
    }
    static set allOpenedLabels(value: AllOpenedLabelsType) {
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY, value);
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
        let stepSha1 = currentLabel.getStepSha(currentLabelStepIndex) || "error";
        let obj =
            GameUnifier.getVariable<CurrentStepTimesCounterMemoty>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY
            ) || {};
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
            GameUnifier.getVariable<CurrentStepTimesCounterMemoty>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY
            ) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        obj[labelId][currentLabelStepIndexId] = data;
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY, obj);
    }
    static getCurrentStepTimesCounter(nestedId: string = ""): number {
        let lastStep = NarrationManagerStatic._stepCounter;
        let obj = NarrationManagerStatic.getCurrentStepTimesCounterData(nestedId);
        if (!obj) {
            logger.error("getCurrentStepTimesCounter obj is null");
            return 0;
        }
        let list = obj.stepCounters || obj.lastStepIndexs || [];
        let listContainLastStep = list.find((item) => item === lastStep);
        if (!listContainLastStep) {
            list.push(lastStep);
            delete obj.lastStepIndexs;
            obj.stepCounters = list;
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
            GameUnifier.getVariable<CurrentStepTimesCounterMemoty>(
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY
            ) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        obj[labelId][currentLabelStepIndexId] = { stepCounters: [], stepSha1: "" };
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY, obj);
    }
    /**
     * is a list of all choices made by the player during the progression of the steps.
     */
    static get allChoicesMade() {
        return GameUnifier.getVariable<ChoicesMadeType[]>(SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY) || [];
    }
    static set allChoicesMade(value: ChoicesMadeType[]) {
        GameUnifier.setVariable(SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY, value);
    }
    static _stepCounter: number = 0;
    /**
     * Increase the last step index that occurred during the progression of the steps.
     */
    static increaseStepCounter() {
        NarrationManagerStatic._stepCounter++;
    }
    private static _openedLabels: OpenedLabel[] = [];
    static get openedLabels(): OpenedLabel[] {
        return createExportableElement(NarrationManagerStatic._openedLabels);
    }
    static set openedLabels(value: OpenedLabel[]) {
        NarrationManagerStatic._openedLabels = createExportableElement(value);
    }
    private static _originalOpenedLabels: OpenedLabel[] = [];
    static get originalOpenedLabels(): OpenedLabel[] {
        return createExportableElement(NarrationManagerStatic._originalOpenedLabels);
    }
    static set originalOpenedLabels(value: OpenedLabel[]) {
        NarrationManagerStatic._originalOpenedLabels = createExportableElement(value);
    }
    static get _currentLabel(): Label | undefined {
        if (NarrationManagerStatic.currentLabelId) {
            return RegisteredLabels.get(NarrationManagerStatic.currentLabelId);
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

    /* Edit History Methods */

    /**
     * Add a label to the history.
     * @param label The label to add to the history.
     * @param stepIndex The step index of the label.
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
    static addChoicesMade(label: LabelIdType, stepIndex: number, stepSha: string, choiceMade: number) {
        let allChoicesMade = NarrationManagerStatic.allChoicesMade;
        let alredyMade = allChoicesMade.findIndex(
            (item) =>
                item.labelId === label &&
                item.stepIndex === stepIndex &&
                item.choiceIndex === choiceMade &&
                item.stepSha1 === stepSha
        );
        if (alredyMade < 0) {
            allChoicesMade.push({
                labelId: label,
                stepIndex: stepIndex,
                choiceIndex: choiceMade,
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
        let currentLabel = RegisteredLabels.get(label);
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

    private static _onStepStart?: (stepId: number, label: LabelAbstract<any>) => void | Promise<void>;
    static set onStepStart(value: (stepId: number, label: LabelAbstract<any>) => void | Promise<void>) {
        NarrationManagerStatic._onStepStart = value;
    }
    static get onStepStart(): ((stepId: number, label: LabelAbstract<any>) => Promise<void[]>) | undefined {
        return async (stepId: number, label: LabelAbstract<any>) => {
            let res: (Promise<void> | void)[] = [];
            if (NarrationManagerStatic.onLoadingLabel && stepId === 0) {
                res.push(NarrationManagerStatic.onLoadingLabel(stepId, label));
            }
            if (NarrationManagerStatic._onStepStart) {
                res.push(NarrationManagerStatic._onStepStart(stepId, label));
            }
            return await Promise.all(res);
        };
    }
    static onLoadingLabel?: (stepId: number, label: LabelAbstract<any>) => void | Promise<void>;
    static onStepEnd?: (stepId: number, label: LabelAbstract<any>) => void | Promise<void>;
}
