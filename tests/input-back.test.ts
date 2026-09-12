import { expect, test } from "vitest";
import { narration, newLabel, stepHistory, storage } from "../src";

const inputBackLabel = newLabel("inputBackLabel", [
    () => {
        narration.dialogue = "Hello!";
    },
    () => {
        narration.dialogue = "What is your name?";
        narration.input.request({ type: "string" });
    },
    () => {
        narration.dialogue = `Nice to meet you, ${narration.input.value}.`;
    },
    () => {
        narration.dialogue = "Goodbye!";
    },
]);

const inputBackWithDefaultLabel = newLabel("inputBackWithDefaultLabel", [
    () => {
        narration.dialogue = "Hello!";
    },
    () => {
        narration.dialogue = "What is your name?";
        narration.input.request({ type: "string" }, "Peter");
    },
    () => {
        narration.dialogue = `Nice to meet you, ${narration.input.value}.`;
    },
    () => {
        narration.dialogue = "Goodbye!";
    },
]);

test("requestInput with no default: the request step starts out with no input value", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(inputBackLabel, {});
    await narration.continue({});
    expect(narration.dialogue?.text).toBe("What is your name?");
    expect(narration.input.isRequired).toBe(true);
    expect(narration.input.value).toBeUndefined();
});

test("stepHistory.back() onto an answered input request restores the player's previous answer as the value", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(inputBackLabel, {}); // index 0: "Hello!"
    await narration.continue({}); // index 1: "What is your name?" (request)
    narration.input.value = "Alice";
    await narration.continue({}); // index 2: "Nice to meet you, Alice."
    await narration.continue({}); // index 3: "Goodbye!"

    await stepHistory.back({}, { steps: 2 }); // back onto index 1, the request
    expect(narration.dialogue?.text).toBe("What is your name?");
    expect(narration.input.isRequired).toBe(true);
    // The player's previous answer, not empty and not some stale unrelated value.
    expect(narration.input.value).toBe("Alice");
});

test("stepHistory.back() onto an answered input request prefers the player's previous answer over the original default", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(inputBackWithDefaultLabel, {}); // index 0: "Hello!"
    await narration.continue({}); // index 1: "What is your name?" (request, default "Peter")
    expect(narration.input.value).toBe("Peter");
    narration.input.value = "Alice";
    await narration.continue({}); // index 2
    await narration.continue({}); // index 3

    await stepHistory.back({}, { steps: 2 }); // back onto index 1
    expect(narration.input.isRequired).toBe(true);
    expect(narration.input.value).toBe("Alice");
});

test("stepHistory.back() one step onto the step right after an answered request is unaffected", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(inputBackLabel, {});
    await narration.continue({});
    narration.input.value = "Alice";
    await narration.continue({});
    await narration.continue({});

    await stepHistory.back({}, { steps: 1 }); // back onto index 2, not the request itself
    expect(narration.dialogue?.text).toBe("Nice to meet you, Alice.");
    expect(narration.input.isRequired).toBe(false);
    expect(narration.input.value).toBe("Alice");
});

test("stepHistory narrativeHistory reflects the restored previous answer instead of stale data after going back", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(inputBackLabel, {});
    await narration.continue({});
    narration.input.value = "Alice";
    await narration.continue({});
    await narration.continue({});

    await stepHistory.back({}, { steps: 2 });
    const requestIndex = narration.stepCounter - 1;
    expect(stepHistory.get(requestIndex)?.inputValue).toBe("Alice");
});

test("stepHistory.back() further back, past the request entirely, still works and leaves no pending input", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(inputBackLabel, {});
    await narration.continue({});
    narration.input.value = "Alice";
    await narration.continue({});
    await narration.continue({});

    await stepHistory.back({}, { steps: 3 }); // back onto index 0, before the request ever ran
    expect(narration.dialogue?.text).toBe("Hello!");
    expect(narration.input.isRequired).toBe(false);
});
