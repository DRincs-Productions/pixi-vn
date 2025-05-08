import { expect, test } from "vitest";
import { ChoiceMenuOption, ChoiceMenuOptionClose, narration, newLabel, stepHistory, storage } from "../src";

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
            new ChoiceMenuOption("Yes, I want to continue", secondPart, {}, { type: "jump" }),
            new ChoiceMenuOptionClose("No, I want to stop here"),
        ];
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
    },
    async () => {
        narration.dialogGlue = true;
        narration.dialogue = ` this topic is no better:`;
    },
]);

test("choice test", async () => {
    narration.clear();
    storage.clear();
    stepHistory.clear();
    await narration.callLabel(startLabel, {});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    await narration.goNext({});
    let choice = narration.choiceMenuOptions![0];
    await narration.selectChoice(choice, {});
    let narrativeHistory = stepHistory.narrativeHistory;
    expect(narrativeHistory).toEqual([
        {
            dialogue: {
                text: "Wait!",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 0,
        },
        {
            dialogue: {
                text: "Wait! I've got a gift for you!",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 1,
        },
        {
            dialogue: {
                text: "...?",
                character: "mc",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 2,
        },
        {
            dialogue: {
                text: "It's food.",
                character: "sly",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 3,
        },
        {
            dialogue: {
                text: "sly.name!",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 4,
        },
        {
            dialogue: {
                text: "sly.name! SPOILERS!!!!",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 5,
        },
        {
            dialogue: {
                text: "steph_fullname goes through the opposite door,",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 6,
        },
        {
            dialogue: {
                text: "steph_fullname goes through the opposite door, and returns with a HUGE tinfoil-covered platter.",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 7,
        },
        {
            dialogue: {
                text: "Looks like you baked way too much again.",
                character: "james",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 8,
        },
        {
            dialogue: {
                text: "He doesn't have to know that!!!",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 9,
        },
        {
            dialogue: {
                text: "...thanks... um...",
                character: "mc",
            },
            playerMadeChoice: false,
            choices: undefined,
            stepIndex: 10,
        },
        {
            dialogue: {
                text: "Oh! You gotta take in your luggage!",
                character: "steph",
            },
            playerMadeChoice: false,
            choices: undefined,
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
            choices: undefined,
            stepIndex: 13,
        },
    ]);
});
