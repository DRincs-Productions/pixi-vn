import { Label } from "../lib/classes/Label";
import { TickerClass } from "../lib/classes/TickerClass";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { tickerDecorator } from "../lib/decorators/TickerDecorator";
import { clearDialogue, setDialogue } from "../lib/functions/DialogueUtility";
import { hideImage } from "../lib/functions/ImageUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { CanvasSprite } from "../lib/pixiElement/SpriteST";
import { StepLabelType } from "../lib/types/StepLabelType";

@tickerDecorator()
export class RotateTicker extends TickerClass<{ elementId: string }> {
    override fn(delta: number, args: { elementId: string }): void {
        let bunny = GameWindowManager.getChild<CanvasSprite>(args.elementId)
        if (!bunny) {
            console.error("bunny not found")
            return
        }
        bunny.rotation += 0.1 * delta;
    }
}

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
                GameWindowManager.addTicker(RotateTicker, { elementId: "bunny" });
            },
            () => hideImage("bunny"), // TODO: remove ticker and crete a manager for this
            () => clearDialogue(),
            () => setDialogue("it is possible to modify the \"Labels\" in runtime. try adding a step in ExempleLabel and then save."),
        ]
    }
}