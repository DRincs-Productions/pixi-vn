import { expect, test } from "vitest";
import { narration, newLabel } from "../src";
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
    await narration.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/test");
    await narration.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/int");
});
