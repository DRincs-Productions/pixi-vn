import { afterEach, expect, test } from "vitest";
import { narration, NarrationManagerStatic, newLabel, stepHistory, storage } from "../src";

afterEach(() => {
    NarrationManagerStatic.onLabelClosing = undefined;
});

const sub = newLabel("lc_sub", [
    async () => {
        narration.dialogue = "Sub line 1.";
    },
    async () => {
        narration.dialogue = "Sub line 2.";
    },
]);

const page1 = newLabel("lc_page1", [
    async () => {
        narration.dialogue = "line1.";
    },
    async (props) => {
        await narration.call(sub, props);
    },
    async () => {
        narration.dialogue = "resumed.";
    },
]);

test("onLabelClosing can defer the natural end of a called label without resuming the parent", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    let pendingClose: (() => Promise<unknown>) | null = null;
    NarrationManagerStatic.onLabelClosing = (_labelId, _props, defaultClose) => {
        pendingClose = defaultClose;
        return undefined;
    };

    await narration.call(page1, {}); // "line1."
    await narration.continue({}); // enters `sub` (a label start, not a close): "Sub line 1."
    await narration.continue({}); // "Sub line 2."
    await narration.continue({}); // `sub` runs out of steps: closing should be deferred

    expect(pendingClose).not.toBeNull();
    expect(narration.dialogue?.text).toEqual("Sub line 2.");
    expect(narration.openedLabels).toEqual([
        { label: "lc_page1", currentStepIndex: 1 },
        { label: "lc_sub", currentStepIndex: 2 },
    ]);

    // resolving the deferred close resumes the parent label
    await pendingClose!();

    expect(narration.dialogue?.text).toEqual("resumed.");
    expect(narration.openedLabels).toEqual([{ label: "lc_page1", currentStepIndex: 2 }]);
});

test("onLabelClosing receives the id of the label that is closing", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    const seenLabelIds: string[] = [];
    NarrationManagerStatic.onLabelClosing = (labelId, _props, defaultClose) => {
        seenLabelIds.push(labelId);
        return defaultClose();
    };

    await narration.call(page1, {});
    await narration.continue({}); // enters `sub`
    await narration.continue({});
    await narration.continue({}); // `sub` closes

    expect(seenLabelIds).toEqual(["lc_sub"]);
    expect(narration.dialogue?.text).toEqual("resumed.");
});

test("onLabelClosing is not called when a jump closes the current label", async () => {
    const page2 = newLabel("lc_page2", [
        async () => {
            narration.dialogue = "page2 line1.";
        },
    ]);
    narration.clear();
    storage.clear();
    stepHistory.clear();

    const seenLabelIds: string[] = [];
    NarrationManagerStatic.onLabelClosing = (labelId, _props, defaultClose) => {
        seenLabelIds.push(labelId);
        return defaultClose();
    };

    await narration.call(page1, {});
    await narration.jump(page2, {});

    expect(seenLabelIds).toEqual([]);
    expect(narration.dialogue?.text).toEqual("page2 line1.");
});
