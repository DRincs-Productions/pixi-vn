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

async function exportGameState() {
    return {
        pixivn_version: PIXIVN_VERSION,
        stepData: narration.export(),
        storageData: await storage.export(),
        soundData: sound.export(),
        historyData: await stepHistory.export(),
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

    const data = await exportGameState();
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
                    ],
                },
            ],
            originalStepData: {
                path: "/",
                canvas: {},
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
    const tempdata = await exportGameState();
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

    expect(await exportGameState()).toEqual(data);
});

test("Game.restoreGameState uses configured navigate when navigate argument is omitted", async () => {
    const previousHandler = GameUnifier.navigate;
    const navigateSpy = vi.fn();
    Game.onNavigate(navigateSpy);

    try {
        Game.clear();
        const data = await Game.exportGameState();
        data.path = "/restore-fallback";

        await Game.restoreGameState(data);

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith("/restore-fallback");
    } finally {
        Game.onNavigate(previousHandler);
    }
});

test("Game.addOnExportGameState: handlers can add and update properties, including async", async () => {
    const syncHandler = (state: GameState) => {
        (state as any).customData = { value: 1 };
        state.path = "/changed-by-hook";
    };
    const asyncHandler = async (state: GameState) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        (state as any).customData.value = 2;
        (state as any).asyncData = "async";
    };
    Game.addOnExportGameState(syncHandler);
    Game.addOnExportGameState(asyncHandler);
    try {
        Game.clear();
        const data = await Game.exportGameState();
        expect((data as any).customData).toEqual({ value: 2 });
        expect((data as any).asyncData).toBe("async");
        expect(data.path).toBe("/changed-by-hook");
        expect(data.pixivn_version).toBe(PIXIVN_VERSION);
        expect(data.historyData).toBeDefined();
    } finally {
        Game.removeOnExportGameState(syncHandler);
        Game.removeOnExportGameState(asyncHandler);
    }
});

test("Game.addOnExportGameState: async handlers run sequentially in registration order", async () => {
    const order: string[] = [];
    const first = async () => {
        order.push("first:start");
        await new Promise((resolve) => setTimeout(resolve, 10));
        order.push("first:end");
    };
    const second = () => {
        order.push("second");
    };
    Game.addOnExportGameState(first);
    Game.addOnExportGameState(second);
    try {
        await Game.exportGameState();
        expect(order).toEqual(["first:start", "first:end", "second"]);
    } finally {
        Game.removeOnExportGameState(first);
        Game.removeOnExportGameState(second);
    }
});

test("Game.removeOnExportGameState removes only that handler; the returned function also removes it", async () => {
    const removed = vi.fn();
    const kept = vi.fn();
    const removedByDisposer = vi.fn();
    Game.addOnExportGameState(removed);
    Game.addOnExportGameState(kept);
    const dispose = Game.addOnExportGameState(removedByDisposer);
    try {
        Game.removeOnExportGameState(removed);
        dispose();
        await Game.exportGameState();
        expect(removed).not.toHaveBeenCalled();
        expect(removedByDisposer).not.toHaveBeenCalled();
        expect(kept).toHaveBeenCalledOnce();
    } finally {
        Game.removeOnExportGameState(kept);
    }
});

test("Game.addOnRestoreGameState: receives the exact save object, before and after restoration", async () => {
    const previousHandler = GameUnifier.navigate;
    const events: string[] = [];
    Game.onNavigate((path) => {
        events.push(`navigate:${path}`);
    });
    let dialogueBeforeRestore: unknown;
    let dialogueAfterRestore: unknown;
    const received: GameState[] = [];
    const before = (state: GameState) => {
        received.push(state);
        events.push("before");
        dialogueBeforeRestore = narration.dialogue?.text;
    };
    const after = (state: GameState) => {
        received.push(state);
        events.push("after");
        dialogueAfterRestore = narration.dialogue?.text;
    };
    Game.addOnRestoreGameState(after, { timing: "after" });
    Game.addOnRestoreGameState(before, { timing: "before" });
    try {
        Game.clear();
        await narration.call(testLabel, {});
        await narration.continue({});
        const data = await Game.exportGameState();
        (data as any).customData = { restored: true };
        data.path = "/restore-hooks";

        Game.clear();
        await Game.restoreGameState(data);

        expect(received).toHaveLength(2);
        expect(received[0]).toBe(data);
        expect(received[1]).toBe(data);
        expect((received[0] as any).customData).toEqual({ restored: true });
        expect(events).toEqual(["before", "navigate:/restore-hooks", "after"]);
        // "before" runs while the game is still cleared, "after" sees the restored narration.
        expect(dialogueBeforeRestore).toBeUndefined();
        expect(dialogueAfterRestore).toBe("This is a test label 2");
    } finally {
        Game.removeOnRestoreGameState(before);
        Game.removeOnRestoreGameState(after);
        Game.onNavigate(previousHandler);
    }
});

test("Game.addOnRestoreGameState: omitted timing defaults to before", async () => {
    const previousHandler = GameUnifier.navigate;
    const events: string[] = [];
    Game.onNavigate(() => {
        events.push("navigate");
    });
    const defaultHandler = () => {
        events.push("default");
    };
    const emptyOptionsHandler = () => {
        events.push("empty-options");
    };
    Game.addOnRestoreGameState(defaultHandler);
    Game.addOnRestoreGameState(emptyOptionsHandler, {});
    try {
        Game.clear();
        const data = await Game.exportGameState();
        await Game.restoreGameState(data);
        expect(events).toEqual(["default", "empty-options", "navigate"]);
    } finally {
        Game.removeOnRestoreGameState(defaultHandler);
        Game.removeOnRestoreGameState(emptyOptionsHandler);
        Game.onNavigate(previousHandler);
    }
});

test("Game.addOnRestoreGameState: async handlers are awaited sequentially in registration order", async () => {
    const previousHandler = GameUnifier.navigate;
    const events: string[] = [];
    Game.onNavigate(() => {
        events.push("navigate");
    });
    const slowBefore = async () => {
        events.push("before1:start");
        await new Promise((resolve) => setTimeout(resolve, 10));
        events.push("before1:end");
    };
    const fastBefore = () => {
        events.push("before2");
    };
    const slowAfter = async () => {
        events.push("after1:start");
        await new Promise((resolve) => setTimeout(resolve, 10));
        events.push("after1:end");
    };
    const fastAfter = () => {
        events.push("after2");
    };
    Game.addOnRestoreGameState(slowAfter, { timing: "after" });
    Game.addOnRestoreGameState(slowBefore);
    Game.addOnRestoreGameState(fastAfter, { timing: "after" });
    Game.addOnRestoreGameState(fastBefore, { timing: "before" });
    try {
        Game.clear();
        const data = await Game.exportGameState();
        await Game.restoreGameState(data);
        expect(events).toEqual([
            "before1:start",
            "before1:end",
            "before2",
            "navigate",
            "after1:start",
            "after1:end",
            "after2",
        ]);
    } finally {
        for (const h of [slowBefore, fastBefore, slowAfter, fastAfter]) {
            Game.removeOnRestoreGameState(h);
        }
        Game.onNavigate(previousHandler);
    }
});

test("Game.removeOnRestoreGameState removes only that handler; the returned function also removes it", async () => {
    const removedBefore = vi.fn();
    const removedAfter = vi.fn();
    const kept = vi.fn();
    Game.addOnRestoreGameState(removedBefore);
    const dispose = Game.addOnRestoreGameState(removedAfter, { timing: "after" });
    Game.addOnRestoreGameState(kept, { timing: "after" });
    try {
        Game.removeOnRestoreGameState(removedBefore);
        dispose();
        Game.clear();
        const data = await Game.exportGameState();
        await Game.restoreGameState(data);
        expect(removedBefore).not.toHaveBeenCalled();
        expect(removedAfter).not.toHaveBeenCalled();
        expect(kept).toHaveBeenCalledOnce();
        expect(kept).toHaveBeenCalledWith(data);
    } finally {
        Game.removeOnRestoreGameState(kept);
    }
});
