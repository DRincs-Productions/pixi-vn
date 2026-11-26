import { beforeEach, expect, test, vi } from "vitest";
import {
    Game,
    type GameState,
    narration,
    newLabel,
    PixiError,
    RegisteredLabels,
    stepHistory,
    storage,
} from "../src";

// Steps are shared between the "old" and the "new" version of a label: a step keeps its sha1
// only if its source code is unchanged, exactly like an untouched step after a game update.
const a0 = () => {
    narration.dialogue = "a0";
};
const a1 = () => {
    narration.dialogue = "a1";
};
const a2 = () => {
    narration.dialogue = "a2";
    storage.set("a2_ran", true);
};
const a2Changed = () => {
    narration.dialogue = "a2 (changed)";
};
const a3 = () => {
    narration.dialogue = "a3";
};
const inserted = () => {
    narration.dialogue = "inserted";
};

const ORIGINAL_A = [a0, a1, a2, a3];

beforeEach(() => {
    Game.clear();
    stepHistory.goBackMode = "step";
    RegisteredLabels.clear();
});

/** Start `label`, advance `continues` times and return the save. */
async function playAndSave(labelId: string, continues: number): Promise<GameState> {
    await narration.call(labelId, {});
    for (let i = 0; i < continues; i++) {
        await narration.continue({});
    }
    return structuredClone(await Game.exportGameState());
}

/** Simulates closing the game, installing an update and loading the save. */
async function loadAfterUpdate(save: GameState, update: () => void) {
    Game.clear();
    RegisteredLabels.clear();
    update();
    await Game.restoreGameState(structuredClone(save));
}

test("a save of an unchanged game is restored exactly", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2);

    await loadAfterUpdate(save, () => newLabel("sc_a", ORIGINAL_A));

    const restored = await Game.exportGameState();
    expect(restored.stepData).toEqual(save.stepData);
    expect(restored.historyData).toEqual(save.historyData);
    expect(narration.dialogue?.text).toBe("a2");
});

test("a step added before the current one: the current step is relocated", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2); // on a2 (index 2)

    await loadAfterUpdate(save, () => newLabel("sc_a", [a0, inserted, a1, a2, a3]));

    expect(narration.openedLabels).toMatchObject([{ label: "sc_a", currentStepIndex: 3 }]);
    expect(narration.dialogue?.text).toBe("a2");
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("a3");
});

test("a step removed before the current one: the current step is relocated", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2); // on a2 (index 2)

    await loadAfterUpdate(save, () => newLabel("sc_a", [a1, a2, a3]));

    expect(narration.openedLabels).toMatchObject([{ label: "sc_a", currentStepIndex: 1 }]);
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("a3");
});

test("going back after a relocation still lands on the right steps", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2);
    await loadAfterUpdate(save, () => newLabel("sc_a", [a0, inserted, a1, a2, a3]));

    await stepHistory.back({});

    expect(narration.dialogue?.text).toBe("a1");
    expect(narration.openedLabels).toMatchObject([{ label: "sc_a", currentStepIndex: 2 }]);
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("a2");
});

test("the current step was changed: the game goes back, internally, to the previous valid step", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2); // on a2, which set "a2_ran"
    expect(save.stepData.stepCounter).toBe(3);

    await loadAfterUpdate(save, () => newLabel("sc_a", [a0, a1, a2Changed, a3]));

    // the whole game state is the one of a1, not only the narration pointer
    expect(narration.dialogue?.text).toBe("a1");
    expect(storage.get("a2_ran")).toBeUndefined();
    expect(narration.openedLabels).toMatchObject([{ label: "sc_a", currentStepIndex: 1 }]);
    expect(narration.stepCounter).toBe(2);
    expect(Array.from(stepHistory.keys())).toEqual([0, 1]);
    expect(stepHistory.narrativeHistory.map((item) => item.dialogue?.text)).toEqual(["a0", "a1"]);

    await narration.continue({});
    expect(narration.dialogue?.text).toBe("a2 (changed)");
});

test("the current (last) step was removed: the game goes back to the previous step", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 3); // on a3, the last step

    await loadAfterUpdate(save, () => newLabel("sc_a", [a0, a1, a2]));

    expect(narration.dialogue?.text).toBe("a2");
    expect(narration.openedLabels).toMatchObject([{ label: "sc_a", currentStepIndex: 2 }]);
});

test("the current step was changed and the history can't go back: the new step runs next", async () => {
    newLabel("sc_a", ORIGINAL_A);
    await narration.call("sc_a", {});
    await narration.continue({});
    await narration.continue({});
    stepHistory.blockGoBack();
    const save = structuredClone(await Game.exportGameState());

    await loadAfterUpdate(save, () => newLabel("sc_a", [a0, a1, a2Changed, a3]));

    expect(narration.openedLabels).toMatchObject([{ label: "sc_a", currentStepIndex: 1 }]);
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("a2 (changed)");
});

const p0 = () => {
    narration.dialogue = "p0";
};
const p1 = async (props: {}) => {
    return await narration.call("sc_child", props);
};
const p2 = () => {
    narration.dialogue = "p2";
};
const c0 = () => {
    narration.dialogue = "c0";
};
const c1 = () => {
    narration.dialogue = "c1";
};

test("a called label was deleted: the game goes back to the parent's last valid step", async () => {
    newLabel("sc_parent", [p0, p1, p2]);
    newLabel("sc_child", [c0, c1]);
    const save = await playAndSave("sc_parent", 2); // on c1, inside sc_child

    await loadAfterUpdate(save, () => newLabel("sc_parent", [p0, p2]));

    expect(narration.dialogue?.text).toBe("p0");
    expect(narration.openedLabels).toMatchObject([{ label: "sc_parent", currentStepIndex: 0 }]);
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("p2");
});

test("a called label was deleted and the history can't go back: it is closed", async () => {
    newLabel("sc_parent", [p0, p1, p2]);
    newLabel("sc_child", [c0, c1]);
    await narration.call("sc_parent", {});
    await narration.continue({});
    await narration.continue({});
    stepHistory.blockGoBack();
    const save = structuredClone(await Game.exportGameState());

    await loadAfterUpdate(save, () => newLabel("sc_parent", [p0, p1, p2]));

    expect(narration.openedLabels).toMatchObject([{ label: "sc_parent", currentStepIndex: 1 }]);
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("p2");
});

test("nothing valid is left: the error handlers receive an obsolete_save PixiError", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2);
    const handler = vi.fn();
    const remove = Game.addOnError(handler);
    try {
        await loadAfterUpdate(save, () => newLabel("sc_other", ORIGINAL_A));

        expect(handler).toHaveBeenCalledOnce();
        const error = handler.mock.calls[0][0];
        expect(error).toBeInstanceOf(PixiError);
        expect(error.code).toBe("obsolete_save");
        expect(narration.openedLabels).toEqual([]);
    } finally {
        remove();
    }
});

test("a save made before step sha1s were recorded is restored as-is", async () => {
    newLabel("sc_a", ORIGINAL_A);
    const save = await playAndSave("sc_a", 2);
    const stripSha = (labels?: { stepSha1?: string }[]) =>
        labels?.forEach((label) => {
            delete label.stepSha1;
        });
    stripSha(save.stepData.openedLabels);
    save.historyData.stepsHistory.forEach((step) => {
        stripSha(step.openedLabels);
        step.diff = step.diff?.filter((diff) => diff.path[diff.path.length - 1] !== "stepSha1");
    });
    stripSha(save.historyData.originalStepData?.openedLabels);

    await loadAfterUpdate(save, () => newLabel("sc_a", [a0, a1, a2Changed, a3]));

    expect(narration.openedLabels).toEqual([{ label: "sc_a", currentStepIndex: 2 }]);
    expect(narration.dialogue?.text).toBe("a2");
});

test("paragraph mode: the game goes back to the start of the last valid paragraph", async () => {
    const b0 = () => {
        narration.dialogue = "b0";
    };
    const b1 = () => {
        narration.dialogue = "b1";
    };
    const b2 = () => {
        narration.dialogue = "b2";
    };
    const b2Changed = () => {
        narration.dialogue = "b2 (changed)";
    };
    const callB = async (props: {}) => {
        return await narration.call("sc_b", props);
    };
    stepHistory.goBackMode = "paragraph";
    newLabel("sc_root", [a0, callB, a3]);
    newLabel("sc_b", [b0, b1, b2]);
    const save = await playAndSave("sc_root", 3); // on b2; the paragraph started at b0

    await loadAfterUpdate(save, () => {
        newLabel("sc_root", [a0, callB, a3]);
        newLabel("sc_b", [b0, b1, b2Changed]);
    });

    expect(narration.dialogue?.text).toBe("b0");
    expect(narration.openedLabels).toMatchObject([
        { label: "sc_root", currentStepIndex: 1 },
        { label: "sc_b", currentStepIndex: 0 },
    ]);
    expect(narration.stepCounter).toBe(2);
    await narration.continue({});
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("b2 (changed)");
});
