import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import type { LabelAbstract } from ".";
import { NARRATION_STORAGE_KEY, SYSTEM_RESERVED_STORAGE_KEYS } from "../constants";
import { createExportableElement } from "../utils";
import { logger } from "../utils/log-utility";
import type Label from "./classes/Label";
import RegisteredLabels from "./decorators/RegisteredLabels";
import type HistoryStep from "./interfaces/HistoryStep";
import type OpenedLabel from "./interfaces/OpenedLabel";
import type ChoicesMadeType from "./types/ChoicesMadeType";
import type { LabelIdType } from "./types/LabelIdType";

type AllOpenedLabelsType = { [key: LabelIdType]: { biggestStep: number; openCount: number } };

type CurrentStepTimesCounterMemotyData = {
    stepCounters?: number[];
    usedRandomNumbers?: { [minmaxkey: string]: number[] };
    stepSha1: string;
};
type CurrentStepTimesCounterMemoty = {
    [key: LabelIdType]: {
        [key: string]: CurrentStepTimesCounterMemotyData;
    };
};

let _openedLabels: OpenedLabel[] = [];
let _originalOpenedLabels: OpenedLabel[] = [];

function setCurrentStepTimesCounterData(
    nestedId: string = "",
    data: CurrentStepTimesCounterMemotyData,
) {
    const currentLabelStepIndexValue = NarrationManagerStatic.currentLabelStepIndex();
    const currentLabelStepIndexId = currentLabelStepIndexValue + nestedId;
    const labelId = NarrationManagerStatic.currentLabelId();
    if (!labelId || currentLabelStepIndexValue === null) {
        logger.error("currentLabelId or currentLabelStepIndex is null");
        return;
    }
    const obj =
        GameUnifier.getVariable<CurrentStepTimesCounterMemoty>(
            NARRATION_STORAGE_KEY,
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY,
        ) || {};
    if (!obj[labelId]) {
        obj[labelId] = {};
    }
    obj[labelId][currentLabelStepIndexId] = data;
    GameUnifier.setVariable(
        NARRATION_STORAGE_KEY,
        SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY,
        obj,
    );
}

namespace NarrationManagerStatic {
    export let choiceMadeTemp: undefined | number = undefined;
    export let lastHistoryStep: Omit<HistoryStep, "diff"> | null = null;
    export let _stepCounter: number = 0;
    export let onLoadingLabel:
        | ((stepId: number, label: LabelAbstract<any>) => void | Promise<void>)
        | undefined = undefined;
    export let onStepEnd:
        | ((stepId: number, label: LabelAbstract<any>) => void | Promise<void>)
        | undefined = undefined;
    export let onStepStart:
        | ((stepId: number, label: LabelAbstract<any>) => void | Promise<void>)
        | undefined = undefined;

    export function allOpenedLabels(): AllOpenedLabelsType {
        return (
            GameUnifier.getVariable<AllOpenedLabelsType>(
                NARRATION_STORAGE_KEY,
                SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY,
            ) || {}
        );
    }
    export function setAllOpenedLabels(value: AllOpenedLabelsType) {
        GameUnifier.setVariable(
            NARRATION_STORAGE_KEY,
            SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY,
            value,
        );
    }
    export function getCurrentStepTimesCounterData(
        nestedId: string = "",
    ): CurrentStepTimesCounterMemotyData | null {
        const currentLabelStepIndexValue = currentLabelStepIndex();
        if (currentLabelStepIndexValue === null) {
            logger.error("currentLabelStepIndex is null");
            return null;
        }
        const currentLabelStepIndexId = `${currentLabelStepIndexValue}${nestedId}`;
        const labelId = currentLabelId();
        const currentLabelValue = currentLabel();
        if (!labelId || currentLabelStepIndexValue === null || !currentLabelValue) {
            logger.error(
                "currentLabelId or currentLabelStepIndex is null or currentLabel not found",
            );
            return null;
        }
        const stepSha1 = currentLabelValue.getStepSha(currentLabelStepIndexValue) || "error";
        const obj =
            GameUnifier.getVariable<CurrentStepTimesCounterMemoty>(
                NARRATION_STORAGE_KEY,
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY,
            ) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        if (
            !obj[labelId][currentLabelStepIndexId] ||
            obj[labelId][currentLabelStepIndexId].stepSha1 !== stepSha1
        ) {
            obj[labelId][currentLabelStepIndexId] = { stepSha1: stepSha1 };
        }
        return obj[labelId][currentLabelStepIndexId];
    }
    export function getCurrentStepTimesCounter(nestedId: string = ""): number {
        const lastStep = _stepCounter;
        const obj = getCurrentStepTimesCounterData(nestedId);
        if (!obj) {
            logger.error("getCurrentStepTimesCounter obj is null");
            return 0;
        }
        const list = obj.stepCounters || [];
        const listContainLastStep = list.find((item) => item === lastStep);
        if (!listContainLastStep) {
            list.push(lastStep);
            obj.stepCounters = list;
            setCurrentStepTimesCounterData(nestedId, obj);
        }
        return list.length;
    }
    export function getRandomNumber(
        min: number,
        max: number,
        options: {
            onceOnly?: boolean;
            nestedId?: string;
        } = {},
    ): number | undefined {
        const nestedId = options.nestedId || "";
        const onceonly = options.onceOnly || false;
        if (onceonly) {
            const obj = getCurrentStepTimesCounterData(nestedId);
            if (!obj) {
                return undefined;
            }
            const usedRandomNumbers = obj.usedRandomNumbers || {};
            const allNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min).filter(
                (item) => !usedRandomNumbers[`${min}-${max}`]?.includes(item),
            );
            if (allNumbers.length === 0) {
                return undefined;
            }
            const randomIndex = Math.floor(Math.random() * allNumbers.length);
            const randomNumber = allNumbers[randomIndex];
            if (!usedRandomNumbers[`${min}-${max}`]) {
                usedRandomNumbers[`${min}-${max}`] = [];
            }
            usedRandomNumbers[`${min}-${max}`].push(randomNumber);
            obj.usedRandomNumbers = usedRandomNumbers;
            setCurrentStepTimesCounterData(nestedId, obj);
            return randomNumber;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    export function resetCurrentStepTimesCounter(nestedId: string = "") {
        const currentLabelStepIndexValue = currentLabelStepIndex();
        const currentLabelStepIndexId = currentLabelStepIndexValue + nestedId;
        const labelId = currentLabelId();
        if (!labelId || currentLabelStepIndexValue === null) {
            logger.error("currentLabelId or currentLabelStepIndex is null");
            return;
        }
        const obj =
            GameUnifier.getVariable<CurrentStepTimesCounterMemoty>(
                NARRATION_STORAGE_KEY,
                SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY,
            ) || {};
        if (!obj[labelId]) {
            obj[labelId] = {};
        }
        obj[labelId][currentLabelStepIndexId] = { stepCounters: [], stepSha1: "" };
        GameUnifier.setVariable(
            NARRATION_STORAGE_KEY,
            SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY,
            obj,
        );
    }
    export function allChoicesMade(): ChoicesMadeType[] {
        return (
            GameUnifier.getVariable<ChoicesMadeType[]>(
                NARRATION_STORAGE_KEY,
                SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY,
            ) || []
        );
    }
    export function setAllChoicesMade(value: ChoicesMadeType[]) {
        GameUnifier.setVariable(
            NARRATION_STORAGE_KEY,
            SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY,
            value,
        );
    }
    export function increaseStepCounter() {
        _stepCounter++;
    }
    export function openedLabels(): OpenedLabel[] {
        return createExportableElement(_openedLabels);
    }
    export function setOpenedLabels(value: OpenedLabel[]) {
        _openedLabels = createExportableElement(value);
    }
    export function originalOpenedLabels(): OpenedLabel[] {
        return createExportableElement(_originalOpenedLabels);
    }
    export function setOriginalOpenedLabels(value: OpenedLabel[]) {
        _originalOpenedLabels = createExportableElement(value);
    }
    export function currentLabel(): Label | undefined {
        const id = currentLabelId();
        if (id) {
            return RegisteredLabels.get(id);
        }
        return undefined;
    }
    export function currentLabelId(): LabelIdType | undefined {
        if (_openedLabels.length > 0) {
            const item = _openedLabels[_openedLabels.length - 1];
            return item.label;
        }
        return undefined;
    }
    export function currentLabelStepIndex(): number | null {
        if (_openedLabels.length > 0) {
            const item = _openedLabels[_openedLabels.length - 1];
            return item.currentStepIndex;
        }
        return null;
    }
    export function addLabelHistory(label: LabelIdType, stepIndex: number) {
        const allOpenedLabelsValue = allOpenedLabels();
        const oldStepIndex = allOpenedLabels()[label]?.biggestStep || 0;
        const openCount = allOpenedLabels()[label]?.openCount || 0;
        if (!oldStepIndex || oldStepIndex < stepIndex) {
            allOpenedLabelsValue[label] = { biggestStep: stepIndex, openCount: openCount };
            setAllOpenedLabels(allOpenedLabelsValue);
        }
    }
    export function addChoicesMade(
        label: LabelIdType,
        stepIndex: number,
        stepSha: string,
        choiceMade: number,
    ) {
        const allChoicesMadeValue = allChoicesMade();
        const alredyMade = allChoicesMadeValue.findIndex(
            (item) =>
                item.labelId === label &&
                item.stepIndex === stepIndex &&
                item.choiceIndex === choiceMade &&
                item.stepSha1 === stepSha,
        );
        if (alredyMade < 0) {
            allChoicesMadeValue.push({
                labelId: label,
                stepIndex: stepIndex,
                choiceIndex: choiceMade,
                stepSha1: stepSha,
                madeTimes: 1,
            });
        } else {
            allChoicesMadeValue[alredyMade].madeTimes++;
        }
        setAllChoicesMade(allChoicesMadeValue);
    }
    export function pushNewLabel(label: LabelIdType) {
        const currentLabelValue = RegisteredLabels.get(label);
        if (!currentLabelValue) {
            throw new PixiError("unregistered_element", `Label ${label} not found`);
        }
        _openedLabels.push({
            label: label,
            currentStepIndex: 0,
        });
        const allOpenedLabelsValue = allOpenedLabels();
        const biggestStep = allOpenedLabels()[label]?.biggestStep || 0;
        const openCount = allOpenedLabels()[label]?.openCount || 0;
        allOpenedLabelsValue[label] = { biggestStep: biggestStep, openCount: openCount + 1 };
        setAllOpenedLabels(allOpenedLabelsValue);
    }
    export function increaseCurrentStepIndex() {
        if (_openedLabels.length > 0) {
            const item = _openedLabels[_openedLabels.length - 1];
            _openedLabels[_openedLabels.length - 1] = {
                ...item,
                currentStepIndex: item.currentStepIndex + 1,
            };
        }
    }
}
export default NarrationManagerStatic;
