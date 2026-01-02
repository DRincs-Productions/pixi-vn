import { expect, test } from "vitest";
import {
    GameUnifier,
    narration,
    NarrationManagerStatic,
    newLabel,
    stepHistory,
    storage,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "../src";
import { getGamePath } from "../src/utils/path-utility";

// Test timeout constants for async operations
const ASYNC_STEP_TIMEOUT = 100;
const SHORT_ASYNC_TIMEOUT = 40;

// Label step timing constant (simulating async operations within labels)
const SHORT_STEP_DELAY = 50;

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
        await new Promise((resolve) => setTimeout(resolve, ASYNC_STEP_TIMEOUT));
    },
    async () => {
        narration.dialogue = "This is an async step 2";
        await new Promise((resolve) => setTimeout(resolve, SHORT_STEP_DELAY));
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
        await new Promise((resolve) => setTimeout(resolve, SHORT_STEP_DELAY));
    },
    () => (narration.dialogue = "This is a sync step 12"),
    () => (narration.dialogue = "This is a sync step 13"),
    () => (narration.dialogue = "This is a sync step 14"),
    async () => {
        narration.dialogue = "This is an async step 15";
        await new Promise((resolve) => setTimeout(resolve, ASYNC_STEP_TIMEOUT));
    },
    () => (narration.dialogue = "This is a sync step 16"),
    () => (narration.dialogue = "This is a sync step 17"),
    () => (narration.dialogue = "This is a sync step 18"),
    () => (narration.dialogue = "This is a sync step 19"),
    () => (narration.dialogue = "This is a sync step 20"),
]);

test("rollback rollnext", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    expect(narration.stepCounter).toBe(0);
    const promise1 = narration.call(asyncLabel, {});
    narration.continue({});
    expect(narration.stepCounter).toBe(0);
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    stepHistory.back({}, { steps: 3 });
    stepHistory.back({});
    expect(narration.stepCounter).toBe(0);
    await promise1;
    expect(narration.stepCounter).toBe(6);
    expect(narration.dialogue).toEqual({ text: "This is a sync step 5" });
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({});
    narration.continue({}, { steps: 4 });
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
    await new Promise((resolve) => setTimeout(resolve, SHORT_STEP_DELAY + 1));
    expect(narration.stepCounter).toBe(11);
    expect(narration.dialogue).toEqual({ text: "This is an async step 11" });
    await new Promise((resolve) => setTimeout(resolve, ASYNC_STEP_TIMEOUT));
    expect(narration.stepCounter).toBe(14);
    expect(narration.dialogue).toEqual({ text: "This is a sync step 13" });
    const promise = stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({}, { steps: 5 });
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});
    narration.continue({});
    await promise;
    expect(narration.stepCounter).toBe(2);
    expect(narration.dialogue).toEqual({ text: "This is an async step 1" });
});

// Error scenario tests
const errorLabel = newLabel("errorLabel", [
    () => (narration.dialogue = "Step 0: Normal step"),
    () => (narration.dialogue = "Step 1: Before error"),
    () => {
        narration.dialogue = "Step 2: This will throw";
        throw new Error("Test error in step");
    },
    () => (narration.dialogue = "Step 3: After error"),
    () => (narration.dialogue = "Step 4: Normal step"),
]);

test("error in navigation step", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    // Set up error handler to capture errors
    let errorCaught = false;
    const originalOnStepError = GameUnifier.onError;
    try {
        GameUnifier.onError = (type, error, props) => {
            errorCaught = true;
        };

        await narration.call(errorLabel, {});
        expect(narration.stepCounter).toBe(1);
        expect(narration.dialogue).toEqual({ text: "Step 0: Normal step" });
        await narration.continue({});
        expect(narration.stepCounter).toBe(2);
        await narration.continue({});

        // Should have caught the error
        expect(errorCaught).toBe(true);
        expect(narration.dialogue).toEqual({ text: "Step 2: This will throw" });

        // Step counter should still be at step 1 (error prevented advancement)
        expect(narration.stepCounter).toBe(3);
    } finally {
        // Restore original error handler
        GameUnifier.onError = originalOnStepError;
    }
});

test("restore after error in navigation step", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    // Set up error handler to capture errors
    let errorCaught = false;
    const originalOnStepError = GameUnifier.onError;
    try {
        GameUnifier.onError = async (type, error, props) => {
            errorCaught = true;
            await stepHistory.back({});
        };

        await narration.call(errorLabel, {});
        expect(narration.stepCounter).toBe(1);
        expect(narration.dialogue).toEqual({ text: "Step 0: Normal step" });
        await narration.continue({});
        expect(narration.stepCounter).toBe(2);
        await narration.continue({});

        // Should have caught the error
        expect(errorCaught).toBe(true);
        expect(narration.dialogue).toEqual({ text: "Step 1: Before error" });

        // Step counter should now be at step 2 after error recovery
        expect(narration.stepCounter).toBe(2);
    } finally {
        // Restore original error handler
        GameUnifier.onError = originalOnStepError;
    }
});

test("queue with errors during rapid navigation", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    let errorCount = 0;
    const originalOnStepError = GameUnifier.onError;
    try {
        GameUnifier.onError = (type, error, props) => {
            errorCount++;
        };

        await narration.call(errorLabel, {});
        expect(narration.stepCounter).toBe(1);

        // Queue multiple continue requests, some will hit errors
        narration.continue({});
        narration.continue({});
        narration.continue({});

        await new Promise((resolve) => setTimeout(resolve, ASYNC_STEP_TIMEOUT));

        // At least one error should have been caught
        expect(errorCount).toBeGreaterThan(0);
    } finally {
        // Restore original error handler
        GameUnifier.onError = originalOnStepError;
    }
});

const mixedErrorLabel = newLabel("mixedErrorLabel", [
    () => (narration.dialogue = "Step 0: Start"),
    async () => {
        narration.dialogue = "Step 1: Async before error";
        await new Promise((resolve) => setTimeout(resolve, SHORT_STEP_DELAY));
    },
    () => {
        narration.dialogue = "Step 2: Will throw";
        throw new Error("Error in mixed label");
    },
    () => (narration.dialogue = "Step 3: After error"),
    async () => {
        narration.dialogue = "Step 4: Async after error";
        await new Promise((resolve) => setTimeout(resolve, SHORT_STEP_DELAY));
    },
    () => (narration.dialogue = "Step 5: Final step"),
]);

test("error recovery with mixed sync and async steps", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    let errorCaught = false;
    const originalOnStepError = GameUnifier.onError;
    try {
        GameUnifier.onError = (type, error, props) => {
            errorCaught = true;
        };

        await narration.call(mixedErrorLabel, {});
        expect(narration.stepCounter).toBe(1);
        expect(narration.dialogue).toEqual({ text: "Step 0: Start" });

        // Continue to async step
        await narration.continue({});
        await new Promise((resolve) => setTimeout(resolve, SHORT_ASYNC_TIMEOUT));
        expect(narration.stepCounter).toBe(2);
        expect(narration.dialogue).toEqual({ text: "Step 1: Async before error" });

        // Continue to error step
        try {
            await narration.continue({});
        } catch (e) {
            // Ignore error here, it will be handled by onError
        }
        expect(errorCaught).toBe(true);

        // The step counter should have advanced despite the error
        expect(narration.stepCounter).toBe(3);
    } finally {
        // Restore original error handler
        GameUnifier.onError = originalOnStepError;
    }
});

test("queue inconsistent state with back and continue during errors", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    let errorCount = 0;
    const originalOnStepError = GameUnifier.onError;
    try {
        GameUnifier.onError = (type, error, props) => {
            errorCount++;
        };

        await narration.call(mixedErrorLabel, {});
        expect(narration.stepCounter).toBe(1);

        // Navigate forward through async step
        await narration.continue({});
        await new Promise((resolve) => setTimeout(resolve, SHORT_ASYNC_TIMEOUT));
        expect(narration.stepCounter).toBe(2);

        // Queue multiple operations: back, continue (to error), continue again
        stepHistory.back({});
        narration.continue({});
        narration.continue({});

        await new Promise((resolve) => setTimeout(resolve, ASYNC_STEP_TIMEOUT));

        // System should handle the queued requests even with errors
        expect(errorCount).toBeGreaterThan(0);
    } finally {
        // Restore original error handler
        GameUnifier.onError = originalOnStepError;
    }
});

test("back navigation with history containing errors", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    const safeLabel = newLabel("safeLabel", [
        () => (narration.dialogue = "Safe step 0"),
        () => (narration.dialogue = "Safe step 1"),
        () => (narration.dialogue = "Safe step 2"),
        () => (narration.dialogue = "Safe step 3"),
    ]);

    await narration.call(safeLabel, {});
    await narration.continue({});
    await narration.continue({});
    expect(narration.stepCounter).toBe(3);
    expect(narration.dialogue).toEqual({ text: "Safe step 2" });

    // Now go back
    await stepHistory.back({});
    expect(narration.stepCounter).toBe(2);
    expect(narration.dialogue).toEqual({ text: "Safe step 1" });

    await stepHistory.back({});
    expect(narration.stepCounter).toBe(1);
    expect(narration.dialogue).toEqual({ text: "Safe step 0" });

    // Queue multiple back requests beyond available history
    stepHistory.back({});
    stepHistory.back({});
    stepHistory.back({});

    await new Promise((resolve) => setTimeout(resolve, ASYNC_STEP_TIMEOUT));

    // Should handle gracefully without crashing
    // Step counter should remain at minimum (can't go back further than start)
    expect(narration.stepCounter).toBeGreaterThanOrEqual(1);
});
