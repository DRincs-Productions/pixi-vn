import { expect, test } from "vitest";
import {
    narration,
    NarrationManagerStatic,
    newLabel,
    stepHistory,
    storage,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "../src";
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
    stepHistory.clear();
    expect(stepHistory.canGoBack).toBe(false);
    await narration.call(pathLabel, {});
    expect(stepHistory.canGoBack).toBe(false);
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.continue({});
    expect(stepHistory.canGoBack).toBe(true);
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    expect(getGamePath()).toBe("/test");
    await stepHistory.back({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(getGamePath()).toBe("/test");
    await stepHistory.back({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
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
        return await narration.jump(labelId, props);
    },
]);

test("stepCounter & currentStepTimesCounter test", async () => {
    narration.clear();
    storage.clear();
    await narration.call(stepCounterLabel, {});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(narration.stepCounter).toBe(2);
    expect(narration.currentStepTimesCounter).toBe(1);
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(narration.stepCounter).toBe(5);
    expect(narration.currentStepTimesCounter).toBe(2);
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(narration.stepCounter).toBe(8);
    expect(narration.currentStepTimesCounter).toBe(3);
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    await stepHistory.back({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    await stepHistory.back({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    expect(narration.stepCounter).toBe(7);
    expect(
        (storage.get(SYSTEM_RESERVED_STORAGE_KEYS.CURRENT_STEP_TIMES_COUNTER_KEY) as any).stepCounter["1"].stepCounters
    ).toEqual([2, 5]);
});

test("addCurrentStepToHistory", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    await narration.call(stepCounterLabel, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(narration.stepCounter).toBe(4);
    narration.addCurrentStepToHistory();
    expect(narration.stepCounter).toBe(5);
});

const currentLabelStepIndexLabel = newLabel("currentLabelStepIndex", [
    async () => {
        narration.dialogue = { character: "james", text: `You're my roommate's replacement, huh?` };
    },
    async () => {
        narration.dialogue = {
            character: "james",
            text: `Don't worry, you don't have much to live up to. Just don't use heroin like the last guy, and you'll be fine!`,
        };
    },
    async () => {
        narration.dialogue = { character: "mc", text: `...` };
    },
    () => {
        narration.dialogue = `He thrusts out his hand.`;
    },
    async () => {
        narration.requestInput({ type: "string" }, "Peter");
        narration.dialogue = `What is your name?`;
    },
    async () => {
        narration.dialogue = { character: "james", text: `james.name!` };
    },
    async () => {
        narration.dialogue = { character: "mc", text: `...mc.name.` };
    },
    async () => {
        narration.dialogue = `I take his hand and shake.`;
    },
]);

test("currentLabelStepIndex", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    expect(narration.stepCounter).toBe(0);
    await narration.call(currentLabelStepIndexLabel, {});
    expect(narration.stepCounter).toBe(1);
    await narration.continue({});
    expect(narration.stepCounter).toBe(2);
    await stepHistory.back({});
    expect(narration.stepCounter).toBe(1);
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    await narration.continue({});
    await stepHistory.back({});
    expect(narration.stepCounter).toBe(1);
    await narration.continue({});
    expect(narration.stepCounter).toBe(2);
    expect(NarrationManagerStatic.currentLabelStepIndex).toBe(1);
});

const asyncLabel = newLabel("asyncLabel", [
    () => (narration.dialogue = "This is a sync step 0"),
    async () => {
        narration.dialogue = "This is an async step 1";
        await new Promise((resolve) => setTimeout(resolve, 100));
    },
    async () => {
        narration.dialogue = "This is an async step 2";
        await new Promise((resolve) => setTimeout(resolve, 50));
    },
    () => (narration.dialogue = "This is a sync step 3"),
    () => (narration.dialogue = "This is a sync step 4"),
    () => (narration.dialogue = "This is a sync step 5"),
    () => (narration.dialogue = "This is a sync step 6"),
    () => (narration.dialogue = "This is a sync step 7"),
    () => (narration.dialogue = "This is a sync step 8"),
    () => (narration.dialogue = "This is a sync step 9"),
    () => (narration.dialogue = "This is a sync step 10"),
    async () => {
        narration.dialogue = "This is an async step 11";
        await new Promise((resolve) => setTimeout(resolve, 50));
    },
    () => (narration.dialogue = "This is a sync step 12"),
    () => (narration.dialogue = "This is a sync step 13"),
    () => (narration.dialogue = "This is a sync step 14"),
    async () => {
        narration.dialogue = "This is an async step 15";
        await new Promise((resolve) => setTimeout(resolve, 100));
    },
    () => (narration.dialogue = "This is a sync step 16"),
    () => (narration.dialogue = "This is a sync step 17"),
    () => (narration.dialogue = "This is a sync step 18"),
    () => (narration.dialogue = "This is a sync step 19"),
    () => (narration.dialogue = "This is a sync step 20"),
]);

test("roolback roolnext", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    expect(narration.stepCounter).toBe(0);
    await narration.call(asyncLabel, {});
    expect(narration.stepCounter).toBe(1);
    expect(narration.dialogue).toEqual({ text: "This is a sync step 0" });
    const promise1 = narration.continue({});
    expect(narration.stepCounter).toBe(1);
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    expect(narration.stepCounter).toBe(1);
    await promise1;
    expect(narration.stepCounter).toBe(6);
    expect(narration.dialogue).toEqual({ text: "This is a sync step 5" });
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    expect(narration.stepCounter).toBe(6);
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    await new Promise((resolve) => setTimeout(resolve, 51));
    expect(narration.stepCounter).toBe(11);
    expect(narration.dialogue).toEqual({ text: "This is an async step 11" });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(narration.stepCounter).toBe(14);
    expect(narration.dialogue).toEqual({ text: "This is a sync step 13" });
    const promise = stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    narration.continue({});
    await promise;
    expect(narration.stepCounter).toBe(2);
    expect(narration.dialogue).toEqual({ text: "This is an async step 1" });
});
