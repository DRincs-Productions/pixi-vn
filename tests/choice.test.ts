import { expect, test } from "vitest";
import { narration, newLabel, stepHistory, storage } from "../src";
import { newChoiceOption } from "../src/narration/classes/ChoiceMenuOption";
import { newCloseChoiceOption } from "../src/narration/classes/CloseChoiceOption";

const ChoiseLabel = newLabel("choice", [
    () => {
        narration.dialogue = "Hello";
    },
    () => {
        narration.dialogue = "What do you choose?";
        narration.choiceMenuOptions = [
            newChoiceOption(
                "A",
                ALabel,
                {},
                {
                    type: "call",
                }
            ),
            newChoiceOption(
                "B",
                BLabel,
                {},
                {
                    type: "jump",
                }
            ),
            newCloseChoiceOption("Close"),
        ];
    },
    () => {
        narration.dialogue = "end";
    },
]);

const ALabel = newLabel("A", [
    () => {
        narration.dialogue = "This is a A label";
    },
    () => {
        narration.dialogue = "This is a A label 2";
    },
    () => {
        narration.dialogue = "This is a A label 3";
    },
]);

const BLabel = newLabel("B", [
    () => {
        narration.dialogue = "This is a B label";
    },
    () => {
        narration.dialogue = "This is a B label 2";
    },
    () => {
        narration.dialogue = "This is a B label 3";
    },
]);

test("choice A", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    await narration.callLabel(ChoiseLabel, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "What do you choose?",
    });
    const choices = narration.choiceMenuOptions;
    expect(choices).toHaveLength(3);
    await narration.selectChoice(choices![0], {});
    expect(narration.dialogue).toEqual({
        text: "This is a A label",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a A label 2",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a A label 3",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "end",
    });
});

test("choice B", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    await narration.callLabel(ChoiseLabel, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "What do you choose?",
    });
    const choices = narration.choiceMenuOptions;
    expect(choices).toHaveLength(3);
    await narration.selectChoice(choices![1], {});
    expect(narration.dialogue).toEqual({
        text: "This is a B label",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a B label 2",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a B label 3",
    });
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "This is a B label 3",
    });
});

test("choice close", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    await narration.callLabel(ChoiseLabel, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(narration.dialogue).toEqual({
        text: "What do you choose?",
    });
    const choices = narration.choiceMenuOptions;
    expect(choices).toHaveLength(3);
    await narration.selectChoice(choices![2], {});
    expect(narration.dialogue).toEqual({
        text: "end",
    });
});
