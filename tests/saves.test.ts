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

export async function restoreGameState(data: Omit<GameState, "canvasData">, navigate: (path: string) => void) {
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
    navigate(data.path);
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
        pixivn_version: "1.0.1",
        stepData: {
            openedLabels: [
                {
                    label: "stepCounter",
                    currentStepIndex: 2,
                },
            ],
            stepCounter: 9,
        },
        storageData: [
            {
                key: "___temp_storage___",
                value: {},
            },
            {
                key: "___temp_storage_deadlines___",
                value: {},
            },
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
                    oltherParams: {},
                },
            },
            {
                key: "___last_dialogue_added_in_step_memory___",
                value: 8,
            },
        ],
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
                            kind: "E",
                            path: ["storage"],
                            lhs: {},
                            rhs: [
                                {
                                    key: "___current_dialogue_memory___",
                                    value: {
                                        text: "This is a test label",
                                        oltherParams: {},
                                    },
                                },
                                {
                                    key: "___last_dialogue_added_in_step_memory___",
                                    value: 0,
                                },
                                {
                                    key: "___opened_labels_counter___",
                                    value: {
                                        stepCounter: {
                                            biggestStep: 0,
                                            openCount: 1,
                                        },
                                    },
                                },
                            ],
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
                    dialoge: {
                        text: "This is a test label",
                        oltherParams: {},
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
                            path: ["storage", 2, "value", "stepCounter", "biggestStep"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["storage", 1, "value"],
                            lhs: 0,
                            rhs: 1,
                        },
                        {
                            kind: "E",
                            path: ["storage", 0, "value", "text"],
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
                    dialoge: {
                        text: "This is a test label 2",
                        oltherParams: {},
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
                            path: ["storage", 2, "value", "stepCounter", "biggestStep"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["storage", 1, "value"],
                            lhs: 1,
                            rhs: 2,
                        },
                        {
                            kind: "E",
                            path: ["storage", 0, "value", "text"],
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
                    dialoge: {
                        text: "This is a test label 3",
                        oltherParams: {},
                    },
                    stepSha1: "3550ef75636a4f0c17e556298dda28279c7875b6",
                    index: 2,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                },
                {
                    diff: [
                        {
                            kind: "A",
                            path: ["storage"],
                            index: 4,
                            item: {
                                kind: "N",
                                rhs: {
                                    key: "___opened_labels_counter___",
                                    value: {
                                        stepCounter: {
                                            biggestStep: 3,
                                            openCount: 2,
                                        },
                                    },
                                },
                            },
                        },
                        {
                            kind: "A",
                            path: ["storage"],
                            index: 3,
                            item: {
                                kind: "N",
                                rhs: {
                                    key: "___last_dialogue_added_in_step_memory___",
                                    value: 3,
                                },
                            },
                        },
                        {
                            kind: "E",
                            path: ["storage", 2, "key"],
                            lhs: "___opened_labels_counter___",
                            rhs: "___current_dialogue_memory___",
                        },
                        {
                            kind: "D",
                            path: ["storage", 2, "value", "stepCounter"],
                            lhs: {
                                biggestStep: 2,
                                openCount: 1,
                            },
                        },
                        {
                            kind: "N",
                            path: ["storage", 2, "value", "text"],
                            rhs: "This is a test label",
                        },
                        {
                            kind: "N",
                            path: ["storage", 2, "value", "oltherParams"],
                            rhs: {},
                        },
                        {
                            kind: "E",
                            path: ["storage", 1, "key"],
                            lhs: "___last_dialogue_added_in_step_memory___",
                            rhs: "___temp_storage_deadlines___",
                        },
                        {
                            kind: "E",
                            path: ["storage", 1, "value"],
                            lhs: 2,
                            rhs: {},
                        },
                        {
                            kind: "E",
                            path: ["storage", 0, "key"],
                            lhs: "___current_dialogue_memory___",
                            rhs: "___temp_storage___",
                        },
                        {
                            kind: "D",
                            path: ["storage", 0, "value", "text"],
                            lhs: "This is a test label 3",
                        },
                        {
                            kind: "D",
                            path: ["storage", 0, "value", "oltherParams"],
                            lhs: {},
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
                    dialoge: {
                        text: "This is a test label",
                        oltherParams: {},
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
                            path: ["storage", 4, "key"],
                            lhs: "___opened_labels_counter___",
                            rhs: "___last_dialogue_added_in_step_memory___",
                        },
                        {
                            kind: "E",
                            path: ["storage", 4, "value"],
                            lhs: {
                                stepCounter: {
                                    biggestStep: 3,
                                    openCount: 2,
                                },
                            },
                            rhs: 4,
                        },
                        {
                            kind: "E",
                            path: ["storage", 3, "key"],
                            lhs: "___last_dialogue_added_in_step_memory___",
                            rhs: "___current_dialogue_memory___",
                        },
                        {
                            kind: "E",
                            path: ["storage", 3, "value"],
                            lhs: 3,
                            rhs: {
                                text: "This is a test label 2",
                                oltherParams: {},
                            },
                        },
                        {
                            kind: "E",
                            path: ["storage", 2, "key"],
                            lhs: "___current_dialogue_memory___",
                            rhs: "___opened_labels_counter___",
                        },
                        {
                            kind: "D",
                            path: ["storage", 2, "value", "text"],
                            lhs: "This is a test label",
                        },
                        {
                            kind: "D",
                            path: ["storage", 2, "value", "oltherParams"],
                            lhs: {},
                        },
                        {
                            kind: "N",
                            path: ["storage", 2, "value", "stepCounter"],
                            rhs: {
                                biggestStep: 3,
                                openCount: 2,
                            },
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
                    dialoge: {
                        text: "This is a test label 2",
                        oltherParams: {},
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
                            path: ["storage", 4, "value"],
                            lhs: 4,
                            rhs: 5,
                        },
                        {
                            kind: "E",
                            path: ["storage", 3, "value", "text"],
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
                    dialoge: {
                        text: "This is a test label 3",
                        oltherParams: {},
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
                            path: ["storage", 4, "value"],
                            lhs: 5,
                            rhs: 6,
                        },
                        {
                            kind: "E",
                            path: ["storage", 3, "value", "text"],
                            lhs: "This is a test label 3",
                            rhs: "This is a test label",
                        },
                        {
                            kind: "E",
                            path: ["storage", 2, "value", "stepCounter", "openCount"],
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
                    dialoge: {
                        text: "This is a test label",
                        oltherParams: {},
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
                            path: ["storage", 4, "value"],
                            lhs: 6,
                            rhs: 7,
                        },
                        {
                            kind: "E",
                            path: ["storage", 3, "value", "text"],
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
                    dialoge: {
                        text: "This is a test label 2",
                        oltherParams: {},
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
                            path: ["storage", 4, "value"],
                            lhs: 7,
                            rhs: 8,
                        },
                        {
                            kind: "E",
                            path: ["storage", 3, "value", "text"],
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
                    dialoge: {
                        text: "This is a test label 3",
                        oltherParams: {},
                    },
                    stepSha1: "3550ef75636a4f0c17e556298dda28279c7875b6",
                    index: 8,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                },
            ],
            originalStepData: {
                path: "/",
                storage: [
                    {
                        key: "___temp_storage___",
                        value: {},
                    },
                    {
                        key: "___temp_storage_deadlines___",
                        value: {},
                    },
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
                            oltherParams: {},
                        },
                    },
                    {
                        key: "___last_dialogue_added_in_step_memory___",
                        value: 8,
                    },
                ],
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
        pixivn_version: "1.0.1",
        stepData: {
            openedLabels: [],
            stepCounter: 0,
        },
        storageData: [],
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
