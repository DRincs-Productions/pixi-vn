import { Assets } from "pixi.js";
import { Label } from "../lib/classes/Label";
import { CanvasContainer } from "../lib/classes/canvas/CanvasContainer";
import { CanvasSprite } from "../lib/classes/canvas/CanvasSprite";
import { TickerRotate } from "../lib/classes/ticker/TickerRotate";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { clearDialogue } from "../lib/functions/DialogueUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { StepLabelType } from "../lib/types/StepLabelType";

@labelDecorator()
export class BaseCanvasElementTestLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            async () => {
                clearDialogue();
                // Create and add a container to the stage
                const container = new CanvasContainer();

                GameWindowManager.addCanvasElement("container", container);

                // Load the bunny texture
                const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

                // Create a 5x5 grid of bunnies in the container
                for (let i = 0; i < 25; i++) {
                    const bunny = new CanvasSprite(texture);

                    bunny.x = (i % 5) * 40;
                    bunny.y = Math.floor(i / 5) * 40;
                    container.addChild(bunny);
                }

                // Move the container to the center
                container.x = GameWindowManager.screen.width / 2;
                container.y = GameWindowManager.screen.height / 2;

                // Center the bunny sprites in local container coordinates
                container.pivot.x = container.width / 2;
                container.pivot.y = container.height / 2;

                GameWindowManager.addTicker("container", new TickerRotate({ speed: 0.01 }));
            },
        ]
    }
}
