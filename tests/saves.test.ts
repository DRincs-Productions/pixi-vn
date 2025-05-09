import { expect, test } from "vitest";
import {
    GameState,
    HistoryManagerStatic,
    narration,
    newLabel,
    PIXIVN_VERSION,
    sound,
    stepHistory,
    storage,
} from "../src";
import { getGamePath } from "../src/utils/path-utility";

const testLabel = newLabel("stepCounter", [
    () => {
        narration.dialogue = "This is a test label";
    },
    () => {
        narration.dialogue = "This is a test label 2";
    },
    () => {
        narration.dialogue = "This is a test label 3";
    },
    async (props, { labelId }) => {
        return await narration.jumpLabel(labelId, props);
    },
]);

function clear() {
    storage.clear();
    sound.clear();
    narration.clear();
    stepHistory.clear();
}

function exportGameState() {
    return {
        pixivn_version: PIXIVN_VERSION,
        stepData: narration.export(),
        storageData: storage.export(),
        soundData: sound.export(),
        historyData: stepHistory.export(),
        path: getGamePath(),
    };
}

export async function restoreGameState(
    data: Omit<GameState, "canvasData">,
    navigate: (path: string) => void | Promise<void>
) {
    if (data.stepData.hasOwnProperty("stepsHistory") && data.stepData.stepsHistory) {
        data.historyData.stepsHistory = data.stepData.stepsHistory;
    }
    if (data.stepData.hasOwnProperty("originalStepData") && data.stepData.originalStepData) {
        data.historyData.originalStepData = data.stepData.originalStepData;
    }
    stepHistory.restore(data.historyData);
    await narration.restore(data.stepData, HistoryManagerStatic.lastHistoryStep);
    storage.restore(data.storageData);
    sound.restore(data.soundData);
    await navigate(data.path);
}

test("Game.exportGameState & Game.clear & Game.exportGameState", async () => {
    clear();
    await narration.callLabel(testLabel, {});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});

    let data = exportGameState();
    expect(data).toEqual({
        pixivn_version: PIXIVN_VERSION,
        stepData: {
            openedLabels: [
                {
                    label: "stepCounter",
                    currentStepIndex: 2,
                },
            ],
            stepCounter: 9,
        },
        storageData: {
            base: [
                {
                    key: "___opened_labels_counter___",
                    value: {
                        stepCounter: {
                            biggestStep: 3,
                            openCount: 3,
                        },
                    },
                },
                {
                    key: "___current_dialogue_memory___",
                    value: {
                        text: "This is a test label 3",
                    },
                },
                {
                    key: "___last_dialogue_added_in_step_memory___",
                    value: 8,
                },
            ],
            temp: [],
            tempDeadlines: [],
            flags: [],
        },
        soundData: {
            soundsPlaying: {},
            soundAliasesOrder: [],
            filters: [],
        },
        historyData: {
            stepsHistory: [
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["path"],
                            lhs: "",
                            rhs: "/",
                        },
                        {
                            kind: "N",
                            path: ["storage", "base"],
                            rhs: [
                                {
                                    key: "___opened_labels_counter___",
                                    value: {
                                        stepCounter: {
                                            biggestStep: 0,
                                            openCount: 1,
                                        },
                                    },
                                },
                                {
                                    key: "___current_dialogue_memory___",
                                    value: {
                                        text: "This is a test label",
                                    },
                                },
                                {
                                    key: "___last_dialogue_added_in_step_memory___",
                                    value: 0,
                                },
                            ],
                        },
                        {
                            kind: "N",
                            path: ["storage", "temp"],
                            rhs: [],
                        },
                        {
                            kind: "N",
                            path: ["storage", "tempDeadlines"],
                            rhs: [],
                        },
                        {
                            kind: "N",
                            path: ["storage", "flags"],
                            rhs: [],
                        },
                        {
                            kind: "E",
                            path: ["canvas"],
                            lhs: {
                                elementAliasesOrder: [],
                                elements: {},
                                stage: {},
                                tickers: {},
                                tickersSteps: {},
                                tickersOnPause: {},
                                tickersToCompleteOnStepEnd: {
                                    tikersIds: [],
                                    stepAlias: [],
                                },
                            },
                        },
                        {
                            kind: "D",
                            path: ["sound", "playInStepIndex"],
                            lhs: {},
                        },
                        {
                            kind: "E",
                            path: ["sound", "filters"],
                            rhs: [],
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: -1,
                            rhs: 0,
                        },
                        {
                            kind: "A",
                            path: ["openedLabels"],
                            index: 0,
                            item: {
                                kind: "N",
                                rhs: {
                                    label: "stepCounter",
                                    currentStepIndex: 0,
                                },
                            },
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label",
                    },
                    stepSha1: "96be3ba3f3367043b673c02aeded9511deb03ace",
                    index: 0,
                    labelStepIndex: 0,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label",
                            rhs: "This is a test label 2",
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 0, "value", "stepCounter", "biggestStep"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 2",
                    },
                    stepSha1: "52f6d974c8653e35f967af2ab007d0d09080c2e9",
                    index: 1,
                    labelStepIndex: 1,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label 2",
                            rhs: "This is a test label 3",
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 0, "value", "stepCounter", "biggestStep"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 3",
                    },
                    stepSha1: "3550ef75636a4f0c17e556298dda28279c7875b6",
                    index: 2,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 2,
                            rhs: 3,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label 3",
                            rhs: "This is a test label",
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 0, "value", "stepCounter", "biggestStep"],
                            lhs: 2,
                            rhs: 3,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 0, "value", "stepCounter", "openCount"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 2,
                            rhs: 0,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 2,
                            rhs: 0,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label",
                    },
                    stepSha1: "f8a7a1ac6f734312857b47f23fa95abb31466c99",
                    index: 3,
                    labelStepIndex: 0,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 3,
                            rhs: 4,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label",
                            rhs: "This is a test label 2",
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 2",
                    },
                    stepSha1: "52f6d974c8653e35f967af2ab007d0d09080c2e9",
                    index: 4,
                    labelStepIndex: 1,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 4,
                            rhs: 5,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label 2",
                            rhs: "This is a test label 3",
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 3",
                    },
                    stepSha1: "3550ef75636a4f0c17e556298dda28279c7875b6",
                    index: 5,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 5,
                            rhs: 6,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label 3",
                            rhs: "This is a test label",
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 0, "value", "stepCounter", "openCount"],
                            lhs: 2,
                            rhs: 3,
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 2,
                            rhs: 0,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 2,
                            rhs: 0,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label",
                    },
                    stepSha1: "f8a7a1ac6f734312857b47f23fa95abb31466c99",
                    index: 6,
                    labelStepIndex: 0,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 6,
                            rhs: 7,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label",
                            rhs: "This is a test label 2",
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 2",
                    },
                    stepSha1: "52f6d974c8653e35f967af2ab007d0d09080c2e9",
                    index: 7,
                    labelStepIndex: 1,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "E",
                            path: ["storage", "base", 2, "value"],
                            lhs: 7,
                            rhs: 8,
                        },
                        {
                            kind: "E",
                            path: ["storage", "base", 1, "value", "text"],
                            lhs: "This is a test label 2",
                            rhs: "This is a test label 3",
                        },
                        {
                            kind: "E",
                            path: ["labelIndex"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["openedLabels", 0, "currentStepIndex"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "N",
                            path: ["canvas"],
                        },
                    ],
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 3",
                    },
                    stepSha1: "3550ef75636a4f0c17e556298dda28279c7875b6",
                    index: 8,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                },
            ],
            originalStepData: {
                path: "/",
                storage: {
                    base: [
                        {
                            key: "___opened_labels_counter___",
                            value: {
                                stepCounter: {
                                    biggestStep: 3,
                                    openCount: 3,
                                },
                            },
                        },
                        {
                            key: "___current_dialogue_memory___",
                            value: {
                                text: "This is a test label 3",
                            },
                        },
                        {
                            key: "___last_dialogue_added_in_step_memory___",
                            value: 8,
                        },
                    ],
                    temp: [],
                    tempDeadlines: [],
                    flags: [],
                },
                sound: {
                    soundsPlaying: {},
                    soundAliasesOrder: [],
                    filters: [],
                },
                labelIndex: 2,
                openedLabels: [
                    {
                        label: "stepCounter",
                        currentStepIndex: 2,
                    },
                ],
            },
        },
        path: "/",
    });

    clear();
    let tempdata = exportGameState();
    expect(tempdata).toEqual({
        pixivn_version: PIXIVN_VERSION,
        stepData: {
            openedLabels: [],
            stepCounter: 0,
        },
        storageData: {
            base: [],
            temp: [],
            tempDeadlines: [],
            flags: [],
        },
        soundData: {
            soundsPlaying: {},
            soundAliasesOrder: [],
            filters: [],
        },
        historyData: {
            stepsHistory: [],
            originalStepData: undefined,
        },
        path: "/",
    });

    await restoreGameState(data, () => {});

    expect(exportGameState()).toEqual(data);
});
