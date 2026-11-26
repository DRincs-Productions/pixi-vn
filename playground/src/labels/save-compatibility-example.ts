import { Game } from "@drincs/pixi-vn";
import { canvas, showText } from "@drincs/pixi-vn/canvas";
import { narration, newLabel } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

/**
 * Loading a save after a game update (issues #513/#514): the player saves on a step that the
 * update then changes. Step 3 saves the game, re-registers this label with a changed step 3 (as a
 * new game version would) and loads the save: the engine must go back, internally and with a
 * single restore, to step 2 - its canvas text and dialogue - and `Continue` must run the new step 3.
 */
const ID = "save-compatibility-example";

function showStepText(text: string) {
    showText("save-compat-text", text, {
        anchor: 0.5,
        x: canvas.width / 2,
        y: canvas.height / 2,
        style: { fill: 0xffffff, fontSize: 64 },
    });
}

// Steps are shared consts: a step keeps its sha1 only if its source code is unchanged.
const step1 = () => {
    canvas.clear();
    showStepText("STEP 1");
    narration.dialogue = "Step 1.";
};
const step2 = () => {
    showStepText("STEP 2");
    narration.dialogue = "Step 2. Continue: step 3 will save, update the game and load.";
};
const step3Old = () => {
    showStepText("STEP 3 (old version)");
    narration.dialogue = "Step 3, old version. Simulating a game update in 1.5s...";
    setTimeout(async () => {
        const save = await Game.exportGameState();
        newLabel(ID, [step1, step2, step3New, step4]);
        await Game.restoreGameState(save);
    }, 1500);
};
const step3New = () => {
    showStepText("STEP 3 (new version)");
    narration.dialogue = "Step 3, new version: the update was applied correctly.";
};
const step4 = () => {
    showStepText("STEP 4");
    narration.dialogue = "Step 4. Close this label to go back to the menu.";
};

registerTestLabel(ID, "Saves: load a save after a game update", [step1, step2, step3Old, step4]);
