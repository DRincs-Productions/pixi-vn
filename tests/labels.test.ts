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
    await narration.callLabel(pathLabel, {});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    expect(getGamePath()).toBe("/test");
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(getGamePath()).toBe("/test");
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
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
        return await narration.jumpLabel(labelId, props);
    },
]);

test("stepCounter & currentStepTimesCounter test", async () => {
    narration.clear();
    storage.clear();
    await narration.callLabel(stepCounterLabel, {});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(narration.stepCounter).toBe(2);
    expect(narration.currentStepTimesCounter).toBe(1);
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(narration.stepCounter).toBe(5);
    expect(narration.currentStepTimesCounter).toBe(2);
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    expect(narration.stepCounter).toBe(8);
    expect(narration.currentStepTimesCounter).toBe(3);
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
    });
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
    });
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
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
    stepHistory.clear();
    await narration.callLabel(stepCounterLabel, {});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
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
    await narration.callLabel(currentLabelStepIndexLabel, {});
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    await narration.goNext({});
    expect(narration.stepCounter).toBe(2);
    expect(NarrationManagerStatic.currentLabelStepIndex).toBe(1);
});
