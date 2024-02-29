import { Label } from "../lib/classes/Label";
import { CanvasSprite } from "../lib/classes/canvas/CanvasSprite";
import { RotateTicker } from "../lib/classes/ticker/RotateTicker";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { hideImage } from "../lib/functions/ImageUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { StepLabelType } from "../lib/types/StepLabelType";

@labelDecorator()
export class TickerTestLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => {
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
            () => {
                // create a new Sprite from an image path
                const bunny = CanvasSprite.from('https://pixijs.com/assets/bunny.png');

                // center the sprite's anchor point
                bunny.anchor.set(0.5);

                GameWindowManager.addChild("bunny2", bunny);
                bunny.x = 200
                bunny.y = 200

                // Listen for animate update
                GameWindowManager.addTicker("bunny2", RotateTicker, { speed: 0.1 });
            },
            () => hideImage("bunny"),
            () => {
                GameWindowManager.removeTickerConnectedToChild("bunny2", RotateTicker)
            }
        ]
    }
}
