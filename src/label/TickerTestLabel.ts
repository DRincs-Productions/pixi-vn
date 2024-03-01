import { Label } from "../lib/classes/Label";
import { CanvasSprite } from "../lib/classes/canvas/CanvasSprite";
import { RotateTicker } from "../lib/classes/ticker/RotateTicker";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { setDialogue } from "../lib/functions/DialogueUtility";
import { removeImage } from "../lib/functions/ImageUtility";
import { GameWindowManager } from "../lib/managers/WindowManager";
import { Pause } from "../lib/types/PauseType";
import { Repeat } from "../lib/types/RepeatType";
import { StepLabelType } from "../lib/types/StepLabelType";

const alien1Tag = "alien1"
const alien2Tag = "alien2"
const alien3Tag = "alien3"

@labelDecorator()
export class TickerTestLabel extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => {
                let my_speed = 0.1
                const alien = CanvasSprite.from('https://pixijs.com/assets/eggHead.png');

                alien.anchor.set(0.5);

                GameWindowManager.addChild(alien1Tag, alien);
                alien.x = 100
                alien.y = 100

                GameWindowManager.addTicker(alien1Tag, new RotateTicker({ speed: my_speed }));
                setDialogue(`I have added a image with a tag ${alien1Tag} and I connected a RotateTicker with a speed of ${my_speed} to it.`)
            },
            () => {
                let my_speed = 0.1
                const alien = CanvasSprite.from('https://pixijs.com/assets/eggHead.png');

                alien.anchor.set(0.5);

                GameWindowManager.addChild(alien2Tag, alien);
                alien.x = 300
                alien.y = 100

                GameWindowManager.addTicker(alien2Tag, new RotateTicker({ speed: my_speed }))
                setDialogue(`I have added a image with a tag ${alien2Tag} and I connected a RotateTicker with a speed of ${my_speed} to it.`)
            },
            () => setDialogue(`Since ${alien1Tag} and ${alien2Tag} they have the same ticker with the same speed, only one RotateTicker will be performed`),
            () => {
                GameWindowManager.addTicker(alien1Tag, new RotateTicker({ speed: 0.2 }))
                setDialogue(`I have changed the speed of the RotateTicker connected to ${alien1Tag} to 0.2`)
            },
            () => setDialogue(`Since ${alien1Tag} have a different speed, it will perform a different RotateTicker`),
            () => {
                removeImage(alien1Tag)
                setDialogue(`I have remove the image with the tag ${alien1Tag}`)
            },
            () => setDialogue(`Since ${alien1Tag} is removed, the RotateTicker connected to it will not be performed`),
            () => {
                GameWindowManager.removeTickerConnectedToChild(alien2Tag, RotateTicker)
                setDialogue(`I have removed the RotateTicker connected to ${alien2Tag}`)
            },
            () => {
                removeImage(alien2Tag)
                let duration = 7000
                const alien = CanvasSprite.from('https://pixijs.com/assets/eggHead.png');
                alien.anchor.set(0.5);
                GameWindowManager.addChild(alien3Tag, alien);
                alien.x = 500
                alien.y = 100
                GameWindowManager.addTicker(alien3Tag, new RotateTicker({ speed: 0.1 }, duration))
                setDialogue(`I have added a image with a tag ${alien3Tag} and I connected a RotateTicker with a speed of 0.1 and a duration of ${duration} to it. After ${duration}ms, the RotateTicker will be removed.`)
            },
            () => {
                let my_speed = 0.1
                let my_speed2 = 0.3
                const alien = CanvasSprite.from('https://pixijs.com/assets/eggHead.png');

                alien.anchor.set(0.5);

                GameWindowManager.addChild(alien1Tag, alien);
                alien.x = 100
                alien.y = 100

                GameWindowManager.addTickersSteps(alien1Tag, [
                    new RotateTicker({ speed: my_speed }, 1000),
                    new RotateTicker({ speed: my_speed2 }, 1000),
                ])
                setDialogue(`I have added a image with a tag ${alien1Tag} and I connected a RotateTicker with a speed of ${my_speed} and a duration of 1000ms and then I connected a RotateTicker with a speed of ${my_speed2} and a duration of 1000ms to it.`)
            },
            () => {
                const alien = CanvasSprite.from('https://pixijs.com/assets/eggHead.png');

                alien.anchor.set(0.5);

                GameWindowManager.addChild(alien2Tag, alien);
                alien.x = 300
                alien.y = 100

                GameWindowManager.addTickersSteps(alien2Tag, [
                    new RotateTicker({ speed: 0.1, clockwise: true }, 2000),
                    Pause(500),
                    new RotateTicker({ speed: 0.2, clockwise: false }, 2000),
                    Repeat,
                ])
            }
        ]
    }
}
