import { afterEach, expect, test } from "vitest";
import { narration, NarrationManagerStatic, newLabel, stepHistory, storage } from "../src";

afterEach(() => {
    NarrationManagerStatic.onLabelClosing = undefined;
    NarrationManagerStatic.onLabelStarting = undefined;
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

test("a goNext-style loop (deferring both onLabelStarting and onLabelClosing) terminates once the story truly ends", async () => {
    // Mirrors a template's `while (!pendingAction && canContinue) await continue()` driver:
    // a called sub-label that closes back into a jump, into a label with no further content.
    const dialogueLog: (string | undefined)[] = [];
    let pending: (() => Promise<unknown>) | undefined;

    NarrationManagerStatic.onLabelStarting = (_labelId, _props, _options, defaultStart) => {
        if (!narration.currentLabel) {
            return defaultStart();
        }
        pending = defaultStart;
        return undefined;
    };
    NarrationManagerStatic.onLabelClosing = (_labelId, _props, defaultClose) => {
        pending = defaultClose;
        return undefined;
    };

    async function goNext(props: object) {
        if (pending) {
            const run = pending;
            pending = undefined;
            await run();
        }
        let iterations = 0;
        while (!pending && narration.canContinue) {
            await narration.continue(props);
            dialogueLog.push(narration.dialogue?.text as string | undefined);
            iterations++;
            if (iterations > 50) {
                throw new Error("infinite loop: canContinue never became false");
            }
        }
    }

    const finalLabel = newLabel("lc_final", [
        async () => {
            narration.dialogue = "the end.";
        },
    ]);
    const closingSub = newLabel("lc_closing_sub", [
        async () => {
            narration.dialogue = "sub only line.";
        },
    ]);
    const outer = newLabel("lc_outer", [
        async (props) => {
            await narration.call(closingSub, props);
        },
        async (props) => {
            return narration.jump(finalLabel, props);
        },
    ]);

    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(outer, {});
    await goNext({}); // enters closingSub (deferred start)
    await goNext({}); // closingSub runs out of steps (deferred close)
    await goNext({}); // resumes outer, hits the jump (deferred start)
    await goNext({}); // enters finalLabel, runs out of steps - must not loop forever

    expect(narration.dialogue?.text).toEqual("the end.");
    expect(narration.openedLabels).toEqual([]);
    expect(narration.canContinue).toEqual(false);
});
