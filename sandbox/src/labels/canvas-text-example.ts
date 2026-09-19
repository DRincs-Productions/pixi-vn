import { canvas, narration, Text } from "@drincs/pixi-vn";
import { registerTestLabel } from "./registry";

/**
 * Example sandbox test label — a template for testing anything that vitest can't cover
 * (real canvas rendering here; the same pattern works for sound/tickers/animations).
 * Copy this file when adding a new one: import `registerTestLabel`, register a unique id,
 * and use it to drive/inspect the feature manually or via `window.pixiVN` (Game.testing).
 */
registerTestLabel("canvas-text-example", "Canvas: show a Text element", [
    (props) => {
        canvas.clear();

        const text = new Text();
        text.text = "Hello from the sandbox!";
        text.anchor = 0.5;
        text.x = canvas.width / 2;
        text.y = canvas.height / 2;
        canvas.add("sandbox-text", text);

        narration.dialogue = {
            text: "A Text element should now be centered on the canvas. Close this label to go back to the menu.",
        };
    },
]);
