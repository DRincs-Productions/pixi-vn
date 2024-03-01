import { Label } from "../lib/classes/Label";
import { CanvasSprite } from '../lib/classes/canvas/CanvasSprite';
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { GameWindowManager } from '../lib/managers/WindowManager';
import { StepLabelType } from "../lib/types/StepLabelType";

/**
 * https://pixijs.com/examples/basic/tinting
 */
@labelDecorator()
export class EventsTestLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => {
                const sprite = CanvasSprite.from('https://pixijs.com/assets/bunny.png');

                // Set the initial position
                sprite.anchor.set(0.5);
                sprite.x = GameWindowManager.screen.width / 2;
                sprite.y = GameWindowManager.screen.height / 2;

                // Opt-in to interactivity
                sprite.eventMode = 'static';

                // Shows hand cursor
                sprite.cursor = 'pointer';

                // Pointers normalize touch and mouse (good for mobile and desktop)
                sprite.on('pointerdown', onClick);

                // Alternatively, use the mouse & touch events:
                // sprite.on('click', onClick); // mouse-only
                // sprite.on('tap', onClick); // touch-only

                GameWindowManager.addChild("bunny", sprite);

                function onClick() {
                    sprite.scale.x *= 1.25;
                    sprite.scale.y *= 1.25;
                }
            },
        ]
    }
}
