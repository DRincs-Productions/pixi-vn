import { narration, newChoiceOption, newLabel } from "@drincs/pixi-vn";
import { testLabels } from "./registry";

/**
 * Root of the playground. Presents every registered test label as a choice, so a human can click
 * through them or an agent can drive the same menu via `window.pixiVN.selectChoice(...)`
 * (see the `pixi-vn-testing` skill). Selecting a choice `call`s the test label, so closing it
 * (`closeCurrentLabel()`/running out of steps) returns here and re-shows the menu.
 */
export const START_LABEL_ID = "playground-start";

export const startLabel = newLabel(START_LABEL_ID, [
    (props) => {
        narration.dialogue = {
            text:
                testLabels.length > 0
                    ? "Pick a playground test to run."
                    : "No playground test labels registered yet — add one under playground/src/labels " +
                      "with registerTestLabel(...) and import it from playground/src/labels/index.ts.",
        };
        narration.choices = testLabels.map((entry) => newChoiceOption(entry.title, entry.id, {}));
    },
    (props) => narration.jump(START_LABEL_ID, props),
]);
