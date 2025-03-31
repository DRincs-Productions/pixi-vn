import { expect, test } from "vitest";
import { narration, newLabel, stepHistory, storage, SYSTEM_RESERVED_STORAGE_KEYS } from "../src";
import { getGamePath } from "../src/utils/path-utility";

const pathLabel = newLabel("path", [
    () => {
        narration.dialogue = "This is a test label";
        window.history.pushState({}, "int", "/int");
    },
    () => {
        narration.dialogue = "This is a test label 2";
        window.history.pushState({}, "test", "/test");
    },
    () => {
        narration.dialogue = "This is a test label 3";
    },
]);

test("path test", async () => {
    narration.clear();
    storage.clear();
    await narration.callLabel(pathLabel, {});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/test");
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/test");
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/int");
});

const stepCounterLabel = newLabel("stepCounter", [
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

test("stepCounter & currentStepTimesCounter test", async () => {
    narration.clear();
    storage.clear();
    await narration.callLabel(stepCounterLabel, {});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    expect(narration.stepCounter).toBe(2);
    expect(narration.currentStepTimesCounter).toBe(1);
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    expect(narration.stepCounter).toBe(5);
    expect(narration.currentStepTimesCounter).toBe(2);
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    expect(narration.stepCounter).toBe(8);
    expect(narration.currentStepTimesCounter).toBe(3);
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
        oltherParams: {},
    });
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    expect(narration.stepCounter).toBe(7);
    expect(
        (storage.getVariable(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY) as any).stepCounter["1"]
            .stepCounters
    ).toEqual([2, 5]);
});

test("addCurrentStepToHistory", async () => {
    narration.clear();
    storage.clear();
    await narration.callLabel(stepCounterLabel, {});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    expect(narration.stepCounter).toBe(4);
    narration.addCurrentStepToHistory();
    expect(narration.stepCounter).toBe(5);
});
