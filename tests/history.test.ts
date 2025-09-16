import { expect, test } from "vitest";
import { narration, newLabel, stepHistory, storage } from "../src";
import { newChoiceOption } from "../src/narration/classes/ChoiceMenuOption";
import { newCloseChoiceOption } from "../src/narration/classes/CloseChoiceOption";

const startLabel = newLabel("choiceshistory", [
    async () => {
        narration.dialogue = { character: "steph", text: `Wait!` };
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = ` I've got a gift for you!`;
    },
    async () => {
        narration.dialogue = { character: "mc", text: `...?` };
    },
    async () => {
        narration.dialogue = { character: "sly", text: `It's food.` };
    },
    async () => {
        narration.dialogue = { character: "steph", text: `sly.name!` };
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = ` SPOILERS!!!!`;
    },
    async () => {
        narration.dialogue = `steph_fullname goes through the opposite door,`;
    },
    async (props) => {
        narration.dialogGlue = true;
        narration.dialogue = ` and returns with a HUGE tinfoil-covered platter.`;
    },
    async () => {
        narration.dialogue = { character: "james", text: `Looks like you baked way too much again.` };
    },
    async () => {
        narration.dialogue = { character: "steph", text: `He doesn't have to know that!!!` };
    },
    async () => {
        narration.dialogue = { character: "mc", text: `...thanks... um...` };
    },
    async () => {
        narration.dialogue = { character: "steph", text: `Oh! You gotta take in your luggage!` };
    },
    async () => {
        narration.dialogue = `You want continue to the next part?`;
        narration.choiceMenuOptions = [
            newChoiceOption("Yes, I want to continue", secondPart, {}, { type: "jump" }),
            newCloseChoiceOption("No, I want to stop here"),
        ];
    },
    async () => {
        narration.dialogue = `She enters my room before I'VE even had a chance to.`;
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = `  \n\n...I could've just come back and gotten the platter later...`;
    },
    async () => {
        narration.dialogue = `She sets it on a desk. I throw my two paper bags down beside the empty bed.`;
    },
]);

const secondPart = newLabel("choiceshistory2", [
    async () => {
        narration.dialogue = `She enters my room before I'VE even had a chance to.`;
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = `  \n\n...I could've just come back and gotten the platter later...`;
    },
    async () => {
        narration.dialogue = `She sets it on a desk. I throw my two paper bags down beside the empty bed.`;
    },
    async () => {
        narration.dialogue = { character: "steph", text: `They got you a new mattress, right?` };
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = ` That last guy was a druggie, did james.name tell you that?`;
    },
    async () => {
        narration.dialogue = { character: "sly", text: `*We're* the reason he got expelled!` };
    },
    async () => {
        narration.dialogue = { character: "steph", text: `sly.name! If word gets out about that...` };
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = ` well, actually, it wouldn't matter, *he's* the one who shot himself up.`;
    },
    async () => {
        narration.dialogue = `I'm fumbling for a new subject.`;
    },
    async () => {
        narration.dialogue = { character: "mc", text: `So, you're all family?` };
    },
    async () => {
        narration.dialogue = `I realize too late`;
        narration.dialogGlue = true;
    },
    async () => {
        narration.dialogue = ` this topic is no better:`;
    },
]);

test("choice test", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    await narration.callLabel(startLabel, {});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(stepHistory.currentLabelHistory).toEqual([
        {
            dialogue: {
                text: ["Wait!", " I've got a gift for you!"],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 1,
        },
        {
            dialogue: {
                character: "mc",
                text: "...?",
            },
            playerMadeChoice: false,
            stepIndex: 2,
        },
        {
            dialogue: {
                character: "sly",
                text: "It's food.",
            },
            playerMadeChoice: false,
            stepIndex: 3,
        },
        {
            dialogue: {
                text: ["sly.name!", " SPOILERS!!!!"],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 5,
        },
        {
            dialogue: {
                text: [
                    "steph_fullname goes through the opposite door,",
                    " and returns with a HUGE tinfoil-covered platter.",
                ],
            },
            playerMadeChoice: false,
            stepIndex: 7,
        },
        {
            dialogue: {
                character: "james",
                text: "Looks like you baked way too much again.",
            },
            playerMadeChoice: false,
            stepIndex: 8,
        },
        {
            dialogue: {
                character: "steph",
                text: "He doesn't have to know that!!!",
            },
            playerMadeChoice: false,
            stepIndex: 9,
        },
        {
            dialogue: {
                character: "mc",
                text: "...thanks... um...",
            },
            playerMadeChoice: false,
            stepIndex: 10,
        },
        {
            dialogue: {
                character: "steph",
                text: "Oh! You gotta take in your luggage!",
            },
            playerMadeChoice: false,
            stepIndex: 11,
        },
        {
            dialogue: {
                text: "You want continue to the next part?",
            },
            playerMadeChoice: false,
            choices: [
                {
                    text: "Yes, I want to continue",
                    type: "jump",
                    isResponse: false,
                    hidden: false,
                },
                {
                    text: "No, I want to stop here",
                    type: "close",
                    isResponse: false,
                    hidden: false,
                },
            ],
            stepIndex: 12,
        },
    ]);
    let choice = narration.choiceMenuOptions![0];
    await narration.selectChoice(choice, {});
    expect(stepHistory.narrativeHistory).toEqual([
        {
            dialogue: {
                text: ["Wait!", " I've got a gift for you!"],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 1,
        },
        {
            dialogue: {
                text: "...?",
                character: "mc",
            },
            playerMadeChoice: false,
            stepIndex: 2,
        },
        {
            dialogue: {
                text: "It's food.",
                character: "sly",
            },
            playerMadeChoice: false,
            stepIndex: 3,
        },
        {
            dialogue: {
                text: ["sly.name!", " SPOILERS!!!!"],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 5,
        },
        {
            dialogue: {
                text: [
                    "steph_fullname goes through the opposite door,",
                    " and returns with a HUGE tinfoil-covered platter.",
                ],
            },
            playerMadeChoice: false,
            stepIndex: 7,
        },
        {
            dialogue: {
                text: "Looks like you baked way too much again.",
                character: "james",
            },
            playerMadeChoice: false,
            stepIndex: 8,
        },
        {
            dialogue: {
                text: "He doesn't have to know that!!!",
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 9,
        },
        {
            dialogue: {
                text: "...thanks... um...",
                character: "mc",
            },
            playerMadeChoice: false,
            stepIndex: 10,
        },
        {
            dialogue: {
                text: "Oh! You gotta take in your luggage!",
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 11,
        },
        {
            dialogue: {
                text: "You want continue to the next part?",
            },
            playerMadeChoice: true,
            choices: [
                {
                    text: "Yes, I want to continue",
                    type: "jump",
                    isResponse: true,
                    hidden: false,
                },
                {
                    text: "No, I want to stop here",
                    type: "close",
                    isResponse: false,
                    hidden: false,
                },
            ],
            stepIndex: 12,
        },
        {
            dialogue: {
                text: "She enters my room before I'VE even had a chance to.",
            },
            playerMadeChoice: false,
            stepIndex: 13,
        },
    ]);
    expect(stepHistory.currentLabelHistory).toEqual([
        {
            dialogue: {
                text: "She enters my room before I'VE even had a chance to.",
            },
            playerMadeChoice: false,
            stepIndex: 13,
        },
    ]);
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await stepHistory.goBack((path) => window.history.pushState({}, "test", path));
    expect(stepHistory.currentLabelHistory).toEqual([
        {
            dialogue: {
                text: [
                    "She enters my room before I'VE even had a chance to.",
                    `  

...I could've just come back and gotten the platter later...`,
                ],
                character: undefined,
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 14,
            inputValue: undefined,
        },
        {
            dialogue: {
                text: "She sets it on a desk. I throw my two paper bags down beside the empty bed.",
                character: undefined,
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 15,
            inputValue: undefined,
        },
        {
            dialogue: {
                text: [
                    "They got you a new mattress, right?",
                    " That last guy was a druggie, did james.name tell you that?",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 17,
            inputValue: undefined,
        },
        {
            dialogue: {
                character: "sly",
                text: "*We're* the reason he got expelled!",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 18,
            inputValue: undefined,
        },
        {
            dialogue: {
                text: "sly.name! If word gets out about that...",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 19,
            inputValue: undefined,
        },
    ]);
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(stepHistory.currentLabelHistory).toEqual([
        {
            dialogue: {
                text: [
                    "She enters my room before I'VE even had a chance to.",
                    `  

...I could've just come back and gotten the platter later...`,
                ],
            },
            playerMadeChoice: false,
            stepIndex: 14,
        },
        {
            dialogue: {
                text: "She sets it on a desk. I throw my two paper bags down beside the empty bed.",
            },
            playerMadeChoice: false,
            stepIndex: 15,
        },
        {
            dialogue: {
                text: [
                    "They got you a new mattress, right?",
                    " That last guy was a druggie, did james.name tell you that?",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 17,
        },
        {
            dialogue: {
                character: "sly",
                text: "*We're* the reason he got expelled!",
            },
            playerMadeChoice: false,
            stepIndex: 18,
        },
        {
            dialogue: {
                text: [
                    "sly.name! If word gets out about that...",
                    " well, actually, it wouldn't matter, *he's* the one who shot himself up.",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 20,
        },
        {
            dialogue: {
                text: "I'm fumbling for a new subject.",
            },
            playerMadeChoice: false,
            stepIndex: 21,
        },
        {
            dialogue: {
                character: "mc",
                text: "So, you're all family?",
            },
            playerMadeChoice: false,
            stepIndex: 22,
        },
        {
            dialogue: {
                text: ["I realize too late", " this topic is no better:"],
            },
            playerMadeChoice: false,
            stepIndex: 24,
        },
    ]);
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    await narration.continue({});
    expect(stepHistory.currentLabelHistory).toEqual([
        {
            dialogue: {
                text: [
                    "She enters my room before I'VE even had a chance to.",
                    `  

...I could've just come back and gotten the platter later...`,
                ],
            },
            playerMadeChoice: false,
            stepIndex: 14,
        },
        {
            dialogue: {
                text: "She sets it on a desk. I throw my two paper bags down beside the empty bed.",
            },
            playerMadeChoice: false,
            stepIndex: 15,
        },
        {
            dialogue: {
                text: [
                    "They got you a new mattress, right?",
                    " That last guy was a druggie, did james.name tell you that?",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 17,
        },
        {
            dialogue: {
                character: "sly",
                text: "*We're* the reason he got expelled!",
            },
            playerMadeChoice: false,
            stepIndex: 18,
        },
        {
            dialogue: {
                text: [
                    "sly.name! If word gets out about that...",
                    " well, actually, it wouldn't matter, *he's* the one who shot himself up.",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 20,
        },
        {
            dialogue: {
                text: "I'm fumbling for a new subject.",
            },
            playerMadeChoice: false,
            stepIndex: 21,
        },
        {
            dialogue: {
                character: "mc",
                text: "So, you're all family?",
            },
            playerMadeChoice: false,
            stepIndex: 22,
        },
        {
            dialogue: {
                text: ["I realize too late", " this topic is no better:"],
            },
            playerMadeChoice: false,
            stepIndex: 24,
        },
    ]);
    expect(stepHistory.narrativeHistory).toEqual([
        {
            dialogue: {
                text: ["Wait!", " I've got a gift for you!"],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 1,
        },
        {
            dialogue: {
                character: "mc",
                text: "...?",
            },
            playerMadeChoice: false,
            stepIndex: 2,
        },
        {
            dialogue: {
                character: "sly",
                text: "It's food.",
            },
            playerMadeChoice: false,
            stepIndex: 3,
        },
        {
            dialogue: {
                text: ["sly.name!", " SPOILERS!!!!"],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 5,
        },
        {
            dialogue: {
                text: [
                    "steph_fullname goes through the opposite door,",
                    " and returns with a HUGE tinfoil-covered platter.",
                ],
            },
            playerMadeChoice: false,
            stepIndex: 7,
        },
        {
            dialogue: {
                character: "james",
                text: "Looks like you baked way too much again.",
            },
            playerMadeChoice: false,
            stepIndex: 8,
        },
        {
            dialogue: {
                character: "steph",
                text: "He doesn't have to know that!!!",
            },
            playerMadeChoice: false,
            stepIndex: 9,
        },
        {
            dialogue: {
                character: "mc",
                text: "...thanks... um...",
            },
            playerMadeChoice: false,
            stepIndex: 10,
        },
        {
            dialogue: {
                character: "steph",
                text: "Oh! You gotta take in your luggage!",
            },
            playerMadeChoice: false,
            stepIndex: 11,
        },
        {
            dialogue: {
                text: "You want continue to the next part?",
            },
            playerMadeChoice: true,
            choices: [
                {
                    text: "Yes, I want to continue",
                    type: "jump",
                    isResponse: true,
                    hidden: false,
                },
                {
                    text: "No, I want to stop here",
                    type: "close",
                    isResponse: false,
                    hidden: false,
                },
            ],
            stepIndex: 12,
        },
        {
            dialogue: {
                text: [
                    "She enters my room before I'VE even had a chance to.",
                    `  

...I could've just come back and gotten the platter later...`,
                ],
            },
            playerMadeChoice: false,
            stepIndex: 14,
        },
        {
            dialogue: {
                text: "She sets it on a desk. I throw my two paper bags down beside the empty bed.",
            },
            playerMadeChoice: false,
            stepIndex: 15,
        },
        {
            dialogue: {
                text: [
                    "They got you a new mattress, right?",
                    " That last guy was a druggie, did james.name tell you that?",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 17,
        },
        {
            dialogue: {
                character: "sly",
                text: "*We're* the reason he got expelled!",
            },
            playerMadeChoice: false,
            stepIndex: 18,
        },
        {
            dialogue: {
                text: [
                    "sly.name! If word gets out about that...",
                    " well, actually, it wouldn't matter, *he's* the one who shot himself up.",
                ],
                character: "steph",
            },
            playerMadeChoice: false,
            stepIndex: 20,
        },
        {
            dialogue: {
                text: "I'm fumbling for a new subject.",
            },
            playerMadeChoice: false,
            stepIndex: 21,
        },
        {
            dialogue: {
                character: "mc",
                text: "So, you're all family?",
            },
            playerMadeChoice: false,
            stepIndex: 22,
        },
        {
            dialogue: {
                text: ["I realize too late", " this topic is no better:"],
            },
            playerMadeChoice: false,
            stepIndex: 24,
        },
    ]);
});
