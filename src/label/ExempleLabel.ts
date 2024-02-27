import { Label } from "../lib/classes/Label";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { clearDialogue, setDialogue } from "../lib/functions/DialogueUtility";
import { hideImage } from "../lib/functions/ImageUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { SpriteST } from "../lib/pixiElement/SpriteST";
import { StepLabelType } from "../lib/types/StepLabelType";

@labelDecorator()
export class ExempleLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => setDialogue("Hello World!"),
            () => {
                setDialogue("This project have 2 parts, the first is the pixijs part, and the second is the react part.")
                // create a new Sprite from an image path
                const bunny = SpriteST.from('https://pixijs.com/assets/bunny.png');

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
            () => hideImage("bunny"), // TODO: remove ticker and crete a manager for this
            () => clearDialogue(),
            () => setDialogue("it is possible to modify the \"Labels\" in runtime. try adding a step in ExempleLabel and then save."),
        ]
    }
}