import { expect, test } from "vitest";
import { narration, newLabel, stepHistory, storage } from "../src";

const deadEnd = newLabel("cc_dead_end", [
    async () => {
        narration.dialogue = "the end.";
    },
]);

test("canContinue becomes false once the last opened label runs out of steps", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();

    await narration.call(deadEnd, {});
    expect(narration.dialogue?.text).toEqual("the end.");
    // the label ran its only step, but hasn't been popped off the stack yet -
    // one more continue() is needed to notice it's done.
    expect(narration.canContinue).toEqual(true);

    await narration.continue({}); // drains openedLabels to []
    expect(narration.openedLabels).toEqual([]);

    // with no label left to run, there is nothing further to continue into -
    // a `while (canContinue) await continue()` caller must be able to stop here.
    expect(narration.canContinue).toEqual(false);
});
