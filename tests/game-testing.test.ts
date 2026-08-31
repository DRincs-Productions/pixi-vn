import { afterEach, beforeEach, expect, test } from "vitest";
import {
    Game,
    GameUnifier,
    narration,
    newChoiceOption,
    newCloseChoiceOption,
    newLabel,
    storage,
    type StepLabelPropsType,
} from "../src";

interface TestProps {
    marker: string;
}

const baseProps: StepLabelPropsType<TestProps> = { marker: "live" };

const gameTestingLabel = newLabel<TestProps>("game-testing-label", [
    (props) => {
        narration.dialogue = `hello ${props.marker}`;
    },
    () => {
        narration.dialogue = "what do you choose?";
        narration.choices = [
            newChoiceOption("A", gameTestingLabel, {}),
            newCloseChoiceOption("Close"),
        ];
    },
    () => {
        narration.dialogue = "what is your name?";
        narration.input.request({ type: "string" });
    },
    () => {
        narration.dialogue = `hi ${narration.input.value}`;
    },
]);

beforeEach(() => {
    Game.testing.disable();
    Game.clear();
    Game.testing.setProps(baseProps);
    GameUnifier.clearOnErrorHandlers();
});

afterEach(() => {
    Game.testing.disable();
    GameUnifier.clearOnErrorHandlers();
});

test("enable: attaches the API to window under the default key and returns it", () => {
    const api = Game.testing.enable();
    expect(Game.testing.isEnabled()).toBe(true);
    expect((window as unknown as Record<string, unknown>).pixiVN).toBe(api);
});

test("enable: honors a custom windowKey", () => {
    const api = Game.testing.enable({ windowKey: "myGameTesting" });
    expect((window as unknown as Record<string, unknown>).myGameTesting).toBe(api);
    expect((window as unknown as Record<string, unknown>).pixiVN).toBeUndefined();
});

test("disable: removes the API from window and is a no-op when not enabled", () => {
    Game.testing.enable();
    Game.testing.disable();
    expect(Game.testing.isEnabled()).toBe(false);
    expect((window as unknown as Record<string, unknown>).pixiVN).toBeUndefined();
    expect(() => Game.testing.disable()).not.toThrow();
});

test("enable: replaces a previous session instead of stacking them", () => {
    const first = Game.testing.enable();
    const second = Game.testing.enable();
    expect(first).not.toBe(second);
    expect((window as unknown as Record<string, unknown>).pixiVN).toBe(second);
});

test("start/continue: use the live props from setProps, merged with extraProps", async () => {
    const api = Game.testing.enable();
    await api.start(gameTestingLabel, { marker: "override" });
    expect(narration.dialogue?.text).toBe("hello override");

    await api.continue();
    expect(narration.dialogue?.text).toBe("what do you choose?");
});

test("setProps: updates the props used by actions, even after enable() already ran", async () => {
    const api = Game.testing.enable();
    Game.testing.setProps({ marker: "updated" });

    await api.start(gameTestingLabel, {});
    expect(narration.dialogue?.text).toBe("hello updated");
});

test("selectChoice: selects the open choice by its choiceIndex", async () => {
    const api = Game.testing.enable();
    await api.start(gameTestingLabel, {});
    await api.continue();
    expect(api.getState().choices?.length).toBe(2);

    await api.selectChoice(1); // "Close"
    expect(api.getState().choices).toBeUndefined();
});

test("selectChoice: throws a helpful error for an unknown index", async () => {
    const api = Game.testing.enable();
    await api.start(gameTestingLabel, {});
    // No choice menu is open yet at this point, so any index is "unknown".
    expect(() => api.selectChoice(99)).toThrow(/no open choice with index 99/);
});

test("setInput + continue: resolves a pending input request", async () => {
    const api = Game.testing.enable();
    await api.start(gameTestingLabel, {});
    await api.continue(); // -> choice step
    await api.selectChoice(1); // close menu, -> input step
    expect(api.getState().input.isRequired).toBe(true);

    api.setInput("Liam");
    expect(api.getState().input.isRequired).toBe(false);

    await api.continue();
    expect(narration.dialogue?.text).toBe("hi Liam");
});

test("goBack: rewinds using the live props", async () => {
    const api = Game.testing.enable();
    await api.start(gameTestingLabel, {});
    await api.continue();
    expect(narration.dialogue?.text).toBe("what do you choose?");

    await api.goBack();
    expect(narration.dialogue?.text).toBe("hello live");
});

test("closeCurrentLabel/closeAllLabels delegate to narration.labels", async () => {
    const api = Game.testing.enable();
    await api.start(gameTestingLabel, {});
    expect(api.getState().labelsOpened.length).toBeGreaterThan(0);

    api.closeAllLabels();
    expect(api.getState().labelsOpened.length).toBe(0);
});

test("props: reflects the live props set via setProps, for direct UI control (e.g. navigate)", () => {
    const api = Game.testing.enable();
    expect(api.props).toEqual(baseProps);

    Game.testing.setProps({ marker: "updated" });
    expect(api.props).toEqual({ marker: "updated" });
});

test("storage/narration/stepHistory/Game are exposed directly for full state control", () => {
    const api = Game.testing.enable();
    expect(api.storage).toBe(storage);
    expect(api.narration).toBe(narration);
    expect(api.Game).toBe(Game);

    api.storage.set("testingFlagValue", 42);
    expect(storage.get("testingFlagValue")).toBe(42);
});

test("getState: reflects canContinue/canGoBack/stepCounter", async () => {
    const api = Game.testing.enable();
    expect(api.getState().canContinue).toBe(false);

    await api.start(gameTestingLabel, {});
    expect(api.getState().canContinue).toBe(true);
    expect(api.getState().canGoBack).toBe(false);

    await api.continue();
    expect(api.getState().canGoBack).toBe(true);
    expect(api.getState().stepCounter).toBeGreaterThan(0);
});

test("errors: captures errors raised via Game.addOnError, and clearErrors empties it", async () => {
    const api = Game.testing.enable();
    expect(api.errors).toEqual([]);

    const boom = new Error("boom");
    await GameUnifier.runOnError(boom, baseProps);

    expect(api.errors).toHaveLength(1);
    expect(api.errors[0].error).toBe(boom);
    expect(typeof api.errors[0].timestamp).toBe("number");

    api.clearErrors();
    expect(api.errors).toEqual([]);
});

test("disable: stops capturing further errors", async () => {
    const api = Game.testing.enable();
    Game.testing.disable();

    await GameUnifier.runOnError(new Error("after disable"), baseProps);
    expect(api.errors).toEqual([]);
});
