import { expect, test, vi } from "vitest";
import {
    Game,
    GameUnifier,
    type GameState,
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
        return await narration.jump(labelId, props);
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
    navigate: (path: string) => void | Promise<void>,
) {
    stepHistory.restore(data.historyData);
    const lastHistoryKey = stepHistory.lastKey;
    if (typeof lastHistoryKey === "number") {
        const historyItem = stepHistory.stepsInfoMap.get(lastHistoryKey) || null;
        await narration.restore(data.stepData, historyItem);
    }
    storage.restore(data.storageData);
    await sound.restore(data.soundData);
    navigate(data.path);
}

test("Game.exportGameState & Game.clear & Game.exportGameState", async () => {
    clear();
    await narration.call(testLabel, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});

    const data = exportGameState();
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
            main: [
                {
                    key: "narration:label:opened",
                    value: {
                        stepCounter: {
                            biggestStep: 3,
                            openCount: 3,
                        },
                    },
                },
                {
                    key: "narration:dialogue",
                    value: {
                        text: "This is a test label 3",
                    },
                },
                {
                    key: "narration:dialogue:step_counter",
                    value: 8,
                },
            ],
            tempDeadlines: [],
        },
        soundData: {
            mediaInstances: {},
        },
        historyData: {
            stepsHistory: [
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label",
                    },
                    stepSha1: "baebec4b549ebe7469c1e505411d708cd3bda655",
                    index: 0,
                    labelStepIndex: 0,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 0,
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 2",
                    },
                    stepSha1: "d470173d5d952b59f404ee196f7e4a7f0f820c7a",
                    index: 1,
                    labelStepIndex: 1,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 1,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 0, "value", "stepCounter", "biggestStep"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label 2",
                            oldValue: "This is a test label",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 3",
                    },
                    stepSha1: "7025258c04dd14d937729de1286486bb81ba833c",
                    index: 2,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 2,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 0, "value", "stepCounter", "biggestStep"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label 3",
                            oldValue: "This is a test label 2",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label",
                    },
                    stepSha1: "e11fba2677964f0a812a7228a77fc75e23929e23",
                    index: 3,
                    labelStepIndex: 0,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 0,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 0, "value", "stepCounter", "biggestStep"],
                            type: "CHANGE",
                            value: 3,
                            oldValue: 2,
                        },
                        {
                            path: ["storage", "main", 0, "value", "stepCounter", "openCount"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label",
                            oldValue: "This is a test label 3",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 3,
                            oldValue: 2,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 0,
                            oldValue: 2,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 0,
                            oldValue: 2,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 2",
                    },
                    stepSha1: "d470173d5d952b59f404ee196f7e4a7f0f820c7a",
                    index: 4,
                    labelStepIndex: 1,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 1,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label 2",
                            oldValue: "This is a test label",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 4,
                            oldValue: 3,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 3",
                    },
                    stepSha1: "7025258c04dd14d937729de1286486bb81ba833c",
                    index: 5,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 2,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label 3",
                            oldValue: "This is a test label 2",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 5,
                            oldValue: 4,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label",
                    },
                    stepSha1: "e11fba2677964f0a812a7228a77fc75e23929e23",
                    index: 6,
                    labelStepIndex: 0,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 0,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 0, "value", "stepCounter", "openCount"],
                            type: "CHANGE",
                            value: 3,
                            oldValue: 2,
                        },
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label",
                            oldValue: "This is a test label 3",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 6,
                            oldValue: 5,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 0,
                            oldValue: 2,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 0,
                            oldValue: 2,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 2",
                    },
                    stepSha1: "d470173d5d952b59f404ee196f7e4a7f0f820c7a",
                    index: 7,
                    labelStepIndex: 1,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 1,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label 2",
                            oldValue: "This is a test label",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 7,
                            oldValue: 6,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 1,
                            oldValue: 0,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
                {
                    currentLabel: "stepCounter",
                    dialogue: {
                        text: "This is a test label 3",
                    },
                    stepSha1: "7025258c04dd14d937729de1286486bb81ba833c",
                    index: 8,
                    labelStepIndex: 2,
                    alreadyMadeChoices: [],
                    isGlued: false,
                    openedLabels: [
                        {
                            label: "stepCounter",
                            currentStepIndex: 2,
                        },
                    ],
                    diff: [
                        {
                            path: ["storage", "main", 1, "value", "text"],
                            type: "CHANGE",
                            value: "This is a test label 3",
                            oldValue: "This is a test label 2",
                        },
                        {
                            path: ["storage", "main", 2, "value"],
                            type: "CHANGE",
                            value: 8,
                            oldValue: 7,
                        },
                        {
                            path: ["labelIndex"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            path: ["openedLabels", 0, "currentStepIndex"],
                            type: "CHANGE",
                            value: 2,
                            oldValue: 1,
                        },
                        {
                            type: "CREATE",
                            path: ["canvas"],
                        },
                    ],
                },
            ],
            originalStepData: {
                path: "/",
                storage: {
                    main: [
                        {
                            key: "narration:label:opened",
                            value: {
                                stepCounter: {
                                    biggestStep: 3,
                                    openCount: 3,
                                },
                            },
                        },
                        {
                            key: "narration:dialogue",
                            value: {
                                text: "This is a test label 3",
                            },
                        },
                        {
                            key: "narration:dialogue:step_counter",
                            value: 8,
                        },
                    ],
                    tempDeadlines: [],
                },
                sound: {
                    mediaInstances: {},
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
    const tempdata = exportGameState();
    expect(tempdata).toEqual({
        pixivn_version: PIXIVN_VERSION,
        stepData: {
            openedLabels: [],
            stepCounter: 0,
        },
        storageData: {
            main: [],
            tempDeadlines: [],
        },
        soundData: {
            mediaInstances: {},
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

test("Game.restoreGameState uses configured navigate when navigate argument is omitted", async () => {
    const previousHandler = GameUnifier.navigate;
    const navigateSpy = vi.fn();
    Game.onNavigate(navigateSpy);

    try {
        Game.clear();
        const data = Game.exportGameState();
        data.path = "/restore-fallback";

        await Game.restoreGameState(data);

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith("/restore-fallback");
    } finally {
        Game.onNavigate(previousHandler);
    }
});
