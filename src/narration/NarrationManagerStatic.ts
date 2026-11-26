import { NARRATION_STORAGE_KEY, SYSTEM_RESERVED_STORAGE_KEYS } from "@constants";
import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import type Label from "@narration/classes/Label";
import type LabelAbstract from "@narration/classes/LabelAbstract";
import RegisteredLabels from "@narration/decorators/RegisteredLabels";
import type HistoryStep from "@narration/interfaces/HistoryStep";
import { AdditionalShaSpetsEnum } from "@narration/interfaces/HistoryStep";
import type OpenedLabel from "@narration/interfaces/OpenedLabel";
import type OpenedLabelsValidation from "@narration/interfaces/OpenedLabelsValidation";
import type ChoicesMadeType from "@narration/types/ChoicesMadeType";
import type { LabelIdType } from "@narration/types/LabelIdType";
import type { StepLabelPropsType, StepLabelResultType } from "@narration/types/StepLabelType";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";

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

export default class NarrationManagerStatic {
    private constructor() {}
    static choiceMadeTemp: undefined | number = undefined;
    static lastHistoryStep: Omit<HistoryStep, "diff"> | null = null;
    /**
     * is a list of all labels that have been opened during the progression of the steps.
     * the key is the label id and the biggest step opened.
     */
    static get allOpenedLabels() {
        return (
            GameUnifier.getVariable<AllOpenedLabelsType>(
                NARRATION_STORAGE_KEY,
                SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY,
            ) || {}
        );
    }
    static set allOpenedLabels(value: AllOpenedLabelsType) {
        GameUnifier.setVariable(
            NARRATION_STORAGE_KEY,
            SYSTEM_RESERVED_STORAGE_KEYS.OPENED_LABELS_COUNTER_KEY,
            value,
        );
    }
    static getCurrentStepTimesCounterData(
        nestedId: string = "",
    ): CurrentStepTimesCounterMemotyData | null {
        const currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        if (currentLabelStepIndex === null) {
            logger.error("currentLabelStepIndex is null");
            return null;
        }
        const currentLabelStepIndexId = `${currentLabelStepIndex}${nestedId}`;
        const labelId = NarrationManagerStatic.currentLabelId;
        const currentLabel = NarrationManagerStatic._currentLabel;
        if (!labelId || currentLabelStepIndex === null || !currentLabel) {
            logger.error(
                "currentLabelId or currentLabelStepIndex is null or currentLabel not found",
            );
            return null;
        }
        const stepSha1 = currentLabel.getStepSha(currentLabelStepIndex) || "error";
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
    private static setCurrentStepTimesCounterData(
        nestedId: string = "",
        data: CurrentStepTimesCounterMemotyData,
    ) {
        const currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        const currentLabelStepIndexId = currentLabelStepIndex + nestedId;
        const labelId = NarrationManagerStatic.currentLabelId;
        if (!labelId || currentLabelStepIndex === null) {
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
    static getCurrentStepTimesCounter(nestedId: string = ""): number {
        const lastStep = NarrationManagerStatic._stepCounter;
        const obj = NarrationManagerStatic.getCurrentStepTimesCounterData(nestedId);
        if (!obj) {
            logger.error("getCurrentStepTimesCounter obj is null");
            return 0;
        }
        const list = obj.stepCounters || [];
        const listContainLastStep = list.find((item) => item === lastStep);
        if (!listContainLastStep) {
            list.push(lastStep);
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
        } = {},
    ): number | undefined {
        const nestedId = options.nestedId || "";
        const onceonly = options.onceOnly || false;
        if (onceonly) {
            const obj = NarrationManagerStatic.getCurrentStepTimesCounterData(nestedId);
            if (!obj) {
                return undefined;
            }
            const usedRandomNumbers = obj.usedRandomNumbers || {};
            // get a random number between min and max and not in the usedRandomNumbers, if all numbers are in the usedRandomNumbers, return null
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
            NarrationManagerStatic.setCurrentStepTimesCounterData(nestedId, obj);
            return randomNumber;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static resetCurrentStepTimesCounter(nestedId: string = "") {
        const currentLabelStepIndex = NarrationManagerStatic.currentLabelStepIndex;
        const currentLabelStepIndexId = currentLabelStepIndex + nestedId;
        const labelId = NarrationManagerStatic.currentLabelId;
        if (!labelId || currentLabelStepIndex === null) {
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
    /**
     * is a list of all choices made by the player during the progression of the steps.
     */
    static get allChoicesMade() {
        return (
            GameUnifier.getVariable<ChoicesMadeType[]>(
                NARRATION_STORAGE_KEY,
                SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY,
            ) || []
        );
    }
    static set allChoicesMade(value: ChoicesMadeType[]) {
        GameUnifier.setVariable(
            NARRATION_STORAGE_KEY,
            SYSTEM_RESERVED_STORAGE_KEYS.ALL_CHOICES_MADE_KEY,
            value,
        );
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
        return undefined;
    }
    /**
     * currentLabelId is the current label id that occurred during the progression of the steps.
     */
    static get currentLabelId(): LabelIdType | undefined {
        if (NarrationManagerStatic._openedLabels.length > 0) {
            const item =
                NarrationManagerStatic._openedLabels[
                    NarrationManagerStatic._openedLabels.length - 1
                ];
            return item.label;
        }
        return undefined;
    }
    static get currentLabelStepIndex(): number | null {
        if (NarrationManagerStatic._openedLabels.length > 0) {
            const item =
                NarrationManagerStatic._openedLabels[
                    NarrationManagerStatic._openedLabels.length - 1
                ];
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
        const allOpenedLabels = NarrationManagerStatic.allOpenedLabels;
        const oldStepIndex = NarrationManagerStatic.allOpenedLabels[label]?.biggestStep || 0;
        const openCount = NarrationManagerStatic.allOpenedLabels[label]?.openCount || 0;
        if (!oldStepIndex || oldStepIndex < stepIndex) {
            allOpenedLabels[label] = { biggestStep: stepIndex, openCount: openCount };
            NarrationManagerStatic.allOpenedLabels = allOpenedLabels;
        }
    }
    static addChoicesMade(
        label: LabelIdType,
        stepIndex: number,
        stepSha: string,
        choiceMade: number,
    ) {
        const allChoicesMade = NarrationManagerStatic.allChoicesMade;
        const alredyMade = allChoicesMade.findIndex(
            (item) =>
                item.labelId === label &&
                item.stepIndex === stepIndex &&
                item.choiceIndex === choiceMade &&
                item.stepSha1 === stepSha,
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
     * @throws {PixiError} when the label is not found in the registered labels.
     */
    static pushNewLabel(label: LabelIdType) {
        const currentLabel = RegisteredLabels.get(label);
        if (!currentLabel) {
            throw new PixiError("unregistered_element", `Label ${label} not found`);
        }
        NarrationManagerStatic._openedLabels.push({
            label: label,
            currentStepIndex: 0,
        });
        const allOpenedLabels = NarrationManagerStatic.allOpenedLabels;
        const biggestStep = NarrationManagerStatic.allOpenedLabels[label]?.biggestStep || 0;
        const openCount = NarrationManagerStatic.allOpenedLabels[label]?.openCount || 0;
        allOpenedLabels[label] = { biggestStep: biggestStep, openCount: openCount + 1 };
        NarrationManagerStatic.allOpenedLabels = allOpenedLabels;
    }
    /**
     * Increase the current step index of the current label.
     */
    static increaseCurrentStepIndex() {
        if (NarrationManagerStatic._openedLabels.length > 0) {
            const item =
                NarrationManagerStatic._openedLabels[
                    NarrationManagerStatic._openedLabels.length - 1
                ];
            const { stepSha1: _previousStepSha, ...rest } = item;
            NarrationManagerStatic._openedLabels[NarrationManagerStatic._openedLabels.length - 1] =
                {
                    ...rest,
                    currentStepIndex: item.currentStepIndex + 1,
                };
        }
    }
    /**
     * Record the sha1 of the step the current label is about to run.
     * @param stepSha The sha1 of the step at the current label's `currentStepIndex`.
     */
    static setCurrentStepSha(stepSha: string) {
        const lastIndex = NarrationManagerStatic._openedLabels.length - 1;
        if (lastIndex < 0) {
            return;
        }
        NarrationManagerStatic._openedLabels[lastIndex] = {
            ...NarrationManagerStatic._openedLabels[lastIndex],
            stepSha1: stepSha,
        };
    }
    /**
     * Check an opened-labels stack (usually from a save) against the labels currently registered,
     * to detect labels that were edited, renamed or deleted after the stack was recorded.
     *
     * For every entry of the stack:
     * - if its label is no longer registered, the stack is invalid from that entry onward;
     * - if the sha1 of the step at `currentStepIndex` still matches the recorded one, it is kept;
     * - if the same step is found at another index (steps were added or removed before it),
     *   `currentStepIndex` is relocated there (the closest match to the old index wins);
     * - otherwise (the step was changed or removed) the stack is invalid from that entry onward.
     *
     * An entry with no usable recorded sha1 (saves made with older versions, a label closing, or a
     * label that doesn't provide step sha1s) is accepted as-is.
     * @param openedLabels The stack to check. It is not modified.
     * @returns The status and the stack to use: relocated when needed, the given one unchanged when
     * invalid.
     */
    static validateOpenedLabels(openedLabels: OpenedLabel[]): OpenedLabelsValidation {
        const result: OpenedLabel[] = [];
        let relocated = false;
        for (let depth = 0; depth < openedLabels.length; depth++) {
            const entry = openedLabels[depth];
            if (!RegisteredLabels.has(entry.label)) {
                return { status: "invalid", openedLabels };
            }
            const label = RegisteredLabels.get(entry.label) as LabelAbstract<any> | undefined;
            const expectedSha = entry.stepSha1;
            if (!label || !NarrationManagerStatic.isComparableSha(expectedSha)) {
                result.push(entry);
                continue;
            }
            const inRange = entry.currentStepIndex >= 0 && entry.currentStepIndex < label.stepCount;
            const currentSha = inRange
                ? NarrationManagerStatic.safeStepSha(label, entry.currentStepIndex)
                : undefined;
            // An in-range step without a usable sha can't be checked, so it is trusted; an index
            // that is now out of range means the recorded step was removed (or moved).
            if (currentSha === expectedSha || (inRange && currentSha === undefined)) {
                result.push(entry);
                continue;
            }
            const newIndex = NarrationManagerStatic.findClosestStepIndex(
                label,
                expectedSha,
                entry.currentStepIndex,
            );
            if (newIndex === undefined) {
                return { status: "invalid", openedLabels };
            }
            logger.warn(
                `The step ${entry.currentStepIndex} of the label "${entry.label}" was moved to ${newIndex} in this version of the game, so it was relocated`,
            );
            relocated = true;
            result.push({ ...entry, currentStepIndex: newIndex });
        }
        return { status: relocated ? "relocated" : "valid", openedLabels: result };
    }
    /**
     * Best-effort repair of an opened-labels stack that {@link validateOpenedLabels} rejected,
     * touching only the narration pointer (used when the history can't rewind to a valid state):
     * - entries whose label is no longer registered are removed;
     * - if the top label's current step was changed or removed, its index is moved back by one, so
     *   that the next `continue()` runs the step now at that position;
     * - a parent whose step was changed keeps its index, so narration resumes after it once the
     *   labels above it close.
     * @returns The repaired stack; empty when nothing usable is left.
     */
    static repairOpenedLabels(openedLabels: OpenedLabel[]): OpenedLabel[] {
        const result: OpenedLabel[] = [];
        openedLabels.forEach((entry, depth) => {
            const isTop = depth === openedLabels.length - 1;
            const validation = NarrationManagerStatic.validateOpenedLabels([entry]);
            if (validation.status !== "invalid") {
                result.push(validation.openedLabels[0]);
                return;
            }
            const label = RegisteredLabels.has(entry.label)
                ? (RegisteredLabels.get(entry.label) as LabelAbstract<any> | undefined)
                : undefined;
            if (!label) {
                logger.warn(
                    `The label "${entry.label}" no longer exists in this version of the game, so it was closed`,
                );
                return;
            }
            logger.warn(
                `The step ${entry.currentStepIndex} of the label "${entry.label}" was changed or removed in this version of the game`,
            );
            result.push({
                label: entry.label,
                currentStepIndex: isTop
                    ? Math.min(entry.currentStepIndex, label.stepCount) - 1
                    : entry.currentStepIndex,
            });
        });
        return result;
    }
    private static isComparableSha(sha: string | undefined): sha is string {
        return (
            !!sha &&
            sha !== AdditionalShaSpetsEnum.ERROR &&
            sha !== AdditionalShaSpetsEnum.DEVELOPER
        );
    }
    private static safeStepSha(label: LabelAbstract<any>, index: number): string | undefined {
        try {
            const sha = label.getStepSha(index);
            return NarrationManagerStatic.isComparableSha(sha) ? sha : undefined;
        } catch (_e) {
            return undefined;
        }
    }
    private static findClosestStepIndex(
        label: LabelAbstract<any>,
        sha: string,
        oldIndex: number,
    ): number | undefined {
        let best: number | undefined;
        for (let index = 0; index < label.stepCount; index++) {
            if (NarrationManagerStatic.safeStepSha(label, index) !== sha) {
                continue;
            }
            if (best === undefined || Math.abs(index - oldIndex) < Math.abs(best - oldIndex)) {
                best = index;
            }
        }
        return best;
    }

    private static _onStepStart?: (
        stepId: number,
        label: LabelAbstract<any>,
    ) => void | Promise<void>;
    static set onStepStart(value: (
        stepId: number,
        label: LabelAbstract<any>,
    ) => void | Promise<void>) {
        NarrationManagerStatic._onStepStart = value;
    }
    static get onStepStart():
        | ((stepId: number, label: LabelAbstract<any>) => Promise<void[]>)
        | undefined {
        return async (stepId: number, label: LabelAbstract<any>) => {
            const res: (Promise<void> | void)[] = [];
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
    /**
     * Is a function that will be executed every time a label is about to be started, either via
     * `call` or `jump` (this includes labels started through a choice of type `"call"` or `"jump"`).
     *
     * By default (when this is not set), the label is started immediately, exactly like before this
     * hook existed. If you set it, you take control: call `defaultStart()` yourself whenever you want
     * the label to actually run (right away, or later, e.g. from a subsequent `next()`-like action in
     * your template). Until `defaultStart()` is called, nothing about the label happens: it is not
     * added to the history and no step of it runs.
     */
    static onLabelStarting?: (
        labelId: LabelIdType,
        props: StepLabelPropsType,
        options: {
            choiceMade?: number;
            closeCurrentLabel?: boolean;
            type: string;
        },
        defaultStart: () => Promise<StepLabelResultType>,
    ) => StepLabelResultType | Promise<StepLabelResultType>;
    /**
     * Is a function that will be executed every time the current label is about to close because it
     * naturally ran out of steps - either control is returning to the label that called it, or, if
     * there's no parent label left on the stack, the game is about to end (see {@link Game.onEnd}).
     *
     * By default (when this is not set), the label is closed immediately, exactly like before this
     * hook existed. If you set it, you take control: call `defaultClose()` yourself whenever you want
     * the label to actually close (right away, or later, e.g. from a subsequent `next()`-like action in
     * your template). Until `defaultClose()` is called, the label stays open: it is not popped off the
     * opened labels stack, narration does not continue into the parent label, and the game does not end
     * even if this was the last label - this is what lets an app show the final paragraph of a story
     * before actually ending it, instead of both happening within the same `continue()` call.
     *
     * This does not fire for a `jump` or a choice's `closeCurrentLabel` option - those close the
     * current label explicitly as part of starting a new one, so {@link onLabelStarting} already
     * covers deferring them.
     */
    static onLabelClosing?: (
        labelId: LabelIdType,
        props: StepLabelPropsType,
        defaultClose: () => Promise<StepLabelResultType>,
    ) => StepLabelResultType | Promise<StepLabelResultType>;
}
