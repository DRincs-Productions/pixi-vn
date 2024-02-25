import { Sprite } from "pixi.js";
import { Label } from "../lib/classes/Label";
import { clearDialogue, setDialogue } from "../lib/functions/DialogueUtility";
import { hideImage } from "../lib/functions/ImageUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { StepLabelType } from "../lib/types/StepLabelType";

export class ExempleLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => setDialogue("Hello World!"),
            () => {
                setDialogue("Hello World! 2")
                // create a new Sprite from an image path
                const bunny = Sprite.from('https://pixijs.com/assets/bunny.png');

                // center the sprite's anchor point
                bunny.anchor.set(0.5);

                GameWindowManager.addChild("bunny", bunny);
                bunny.x = 100
                bunny.y = 100

                // Listen for animate update
                GameWindowManager.app.ticker.add((delta) => {
                    // just for fun, let's rotate mr rabbit a little
                    // delta is 1 if running at 100% performance
                    // creates frame-independent transformation
                    bunny.rotation += 0.1 * delta;
                });
            },
            () => setDialogue("Hello World! 3"),
            () => hideImage("bunny"), // TODO: remove ticker and crete a manager for this
            () => clearDialogue(),
            () => setDialogue("Hello World! 4"),
            () => setDialogue("Hello World! 5"),
            () => setDialogue("Hello World! 6"),
        ]
    }
}