import { canvas, showText } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
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

        showText("sandbox-text", "Hello from the sandbox!", {
            anchor: 0.5,
            x: canvas.width / 2,
            y: canvas.height / 2,
        });

        narration.dialogue = {
            text: "A Text element should now be centered on the canvas. Close this label to go back to the menu.",
        };
    },
]);
