import { afterEach, expect, test } from "vitest";
import { narration, NarrationManagerStatic, newLabel, stepHistory, storage } from "../src";

afterEach(() => {
    NarrationManagerStatic.onLabelStarting = undefined;
});

const sideEffects: string[] = [];

const sub = newLabel("ls_sub", [
    async () => {
        sideEffects.push("sound:sub-enter");
        narration.dialogue = "Sub line 1.";
    },
    async () => {
        narration.dialogue = "Sub line 2.";
    },
]);

const page1 = newLabel("ls_page1", [
    async () => {
        narration.dialogue = "line1.";
    },
    async () => {
        narration.dialogue = "line2.";
    },
    async (props) => {
        await narration.call(sub, props);
    },
    async () => {
        narration.dialogue = "resumed.";
    },
]);

const page2 = newLabel("ls_page2", [
    async () => {
        narration.dialogue = "page2 line1.";
    },
]);

test("onLabelStarting can defer a nested call without running any of its side effects", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    sideEffects.length = 0;

    let pendingStart: (() => Promise<unknown>) | null = null;
    NarrationManagerStatic.onLabelStarting = (_labelId, _props, _options, defaultStart) => {
        // only defer nested calls (paragraph-opening); let the page-opening call run immediately
        if (narration.openedLabels.length > 0) {
            pendingStart = defaultStart;
            return undefined;
        }
        return defaultStart();
    };

    await narration.call(page1, {});
    await narration.continue({}); // "line2."
    await narration.continue({}); // hits the call to `sub`: should be deferred, not executed

    expect(pendingStart).not.toBeNull();
    expect(sideEffects).toEqual([]);
    expect(narration.dialogue?.text).toEqual("line2.");
    expect(narration.openedLabels).toEqual([{ label: "ls_page1", currentStepIndex: 2 }]);
    expect(stepHistory.currentLabelHistory.map((item) => item.dialogue?.text)).toEqual([
        "line1.",
        "line2.",
    ]);

    // nothing runs until we explicitly resolve the pending start
    await pendingStart!();

    expect(sideEffects).toEqual(["sound:sub-enter"]);
    expect(narration.dialogue?.text).toEqual("Sub line 1.");
    expect(narration.openedLabels).toEqual([
        { label: "ls_page1", currentStepIndex: 2 },
        { label: "ls_sub", currentStepIndex: 0 },
    ]);
    expect(
        stepHistory.currentLabelHistory.map((item) => [
            item.dialogue?.text,
            item.openedLabelsNumber,
        ]),
    ).toEqual([
        ["line1.", 1],
        ["line2.", 1],
        ["Sub line 1.", 2],
    ]);
});

test("onLabelStarting receives the same options passed to startLabel (choiceMade, closeCurrentLabel, type)", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    const seenOptions: unknown[] = [];
    NarrationManagerStatic.onLabelStarting = (_labelId, _props, options, defaultStart) => {
        seenOptions.push(options);
        return defaultStart();
    };

    await narration.call(page1, {});
    await narration.jump(page2, {});

    expect(seenOptions).toEqual([
        { choiceMade: undefined, type: "calling" },
        { choiceMade: undefined, closeCurrentLabel: true, type: "jumping to" },
    ]);
});

test("onLabelStarting can queue up label starts (with their props) and run them later, in order", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    const queue: { labelId: string; props: object; start: () => Promise<unknown> }[] = [];
    NarrationManagerStatic.onLabelStarting = (labelId, props, _options, defaultStart) => {
        // set the label aside instead of running it now
        queue.push({ labelId, props, start: defaultStart });
        return undefined;
    };

    await narration.call(page1, {});

    // nothing actually ran: it was only queued
    expect(narration.openedLabels).toEqual([]);
    expect(narration.dialogue).toBeUndefined();
    expect(queue.map(({ labelId, props }) => ({ labelId, props }))).toEqual([
        { labelId: "ls_page1", props: {} },
    ]);

    // "a second moment": actually start what was queued
    const page1Entry = queue.shift()!;
    await page1Entry.start();

    expect(narration.dialogue?.text).toEqual("line1.");
    expect(narration.openedLabels).toEqual([{ label: "ls_page1", currentStepIndex: 0 }]);

    await narration.continue({}); // "line2." (a plain step, no label starting involved)

    // from here, a jump is requested; since narration already progressed past step 0
    // this is a real jump (not reduced to a call), and it gets queued too
    await narration.jump(page2, {});

    expect(narration.dialogue?.text).toEqual("line2."); // still unchanged: the jump hasn't run yet
    expect(narration.openedLabels).toEqual([{ label: "ls_page1", currentStepIndex: 1 }]);
    expect(queue.map(({ labelId, props }) => ({ labelId, props }))).toEqual([
        { labelId: "ls_page2", props: {} },
    ]);

    // resolve it whenever we want, later still
    const page2Entry = queue.shift()!;
    await page2Entry.start();

    expect(narration.dialogue?.text).toEqual("page2 line1.");
    expect(narration.openedLabels).toEqual([{ label: "ls_page2", currentStepIndex: 0 }]);
    expect(queue).toEqual([]);
});
