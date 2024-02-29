import { Label } from "../lib/classes/Label";
import { CanvasSprite } from "../lib/classes/canvas/CanvasSprite";
import { RotateTicker } from "../lib/classes/ticker/RotateTicker";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { clearDialogue, setDialogue } from "../lib/functions/DialogueUtility";
import { removeImage } from "../lib/functions/ImageUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { StepLabelType } from "../lib/types/StepLabelType";

@labelDecorator()
export class ExempleLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => setDialogue("Hello World!"),
            () => {
                setDialogue("This project have 2 parts, the first is the pixijs part, and the second is the react part.")
                // create a new Sprite from an image path
                const bunny = CanvasSprite.from('https://pixijs.com/assets/bunny.png');

                // center the sprite's anchor point
                bunny.anchor.set(0.5);

                GameWindowManager.addChild("bunny", bunny);
                bunny.x = 100
                bunny.y = 100

                // Listen for animate update
                GameWindowManager.addTicker("bunny", RotateTicker, { speed: 0.1 });
            },
            () => removeImage("bunny"), // TODO: remove ticker and crete a manager for this
            () => clearDialogue(),
            () => setDialogue("it is possible to modify the \"Labels\" in runtime. try adding a step in ExempleLabel and then save."),
        ]
    }
}
