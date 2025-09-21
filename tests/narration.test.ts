import { expect, test } from "vitest";
import { narration, stepHistory, storage } from "../src";

test(`"" dialogue`, async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    narration.dialogue = "Hello";
    narration.dialogue = "";
    expect(narration.dialogue).toEqual({ text: "" });
});
