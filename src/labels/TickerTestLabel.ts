import { Assets } from "pixi.js";
import { CanvasSprite, GameWindowManager, newLabel, Pause, removeCanvasElement, Repeat, setDialogue, TickerFadeAlpha, TickerRotate } from "../pixi-vn/src";

const alien1Tag = "alien1"
const alien2Tag = "alien2"
const alien3Tag = "alien3"
const alien4Tag = "alien4"

export const tickerTestLabel = newLabel("TickerTestLabel",
    [
        async () => {
            let my_speed = 0.1
            // Load the bunny texture
            const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');
            const alien = CanvasSprite.from(texture);

            alien.anchor.set(0.5);

            GameWindowManager.addCanvasElement(alien1Tag, alien);
            alien.x = 100
            alien.y = 100

            GameWindowManager.addTicker(alien1Tag, new TickerRotate({ speed: my_speed }));
            setDialogue(`I have added a image with a tag ${alien1Tag} and I connected a RotateTicker with a speed of ${my_speed} to it.`)
        },
        async () => {
            let my_speed = 0.1
            const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');
            const alien = CanvasSprite.from(texture);

            alien.anchor.set(0.5);

            GameWindowManager.addCanvasElement(alien2Tag, alien);
            alien.x = 300
            alien.y = 100

            GameWindowManager.addTicker(alien2Tag, new TickerRotate({ speed: my_speed }))
            setDialogue(`I have added a image with a tag ${alien2Tag} and I connected a RotateTicker with a speed of ${my_speed} to it.`)
        },
        () => setDialogue(`Since ${alien1Tag} and ${alien2Tag} they have the same ticker with the same speed, only one RotateTicker will be performed`),
        () => {
            GameWindowManager.addTicker(alien1Tag, new TickerRotate({ speed: 0.2 }))
            setDialogue(`I have changed the speed of the RotateTicker connected to ${alien1Tag} to 0.2`)
        },
        () => setDialogue(`Since ${alien1Tag} have a different speed, it will perform a different RotateTicker`),
        () => {
            removeCanvasElement(alien1Tag)
            setDialogue(`I have remove the image with the tag ${alien1Tag}`)
        },
        () => setDialogue(`Since ${alien1Tag} is removed, the RotateTicker connected to it will not be performed`),
        () => {
            GameWindowManager.removeAssociationBetweenTickerCanvasElement(alien2Tag, TickerRotate)
            setDialogue(`I have removed the RotateTicker connected to ${alien2Tag}`)
        },
        async () => {
            removeCanvasElement(alien2Tag)
            let duration = 7000
            const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');
            const alien = CanvasSprite.from(texture);
            alien.anchor.set(0.5);
            GameWindowManager.addCanvasElement(alien3Tag, alien);
            alien.x = 500
            alien.y = 100
            GameWindowManager.addTicker(alien3Tag, new TickerRotate({ speed: 0.1 }, duration))
            setDialogue(`I have added a image with a tag ${alien3Tag} and I connected a RotateTicker with a speed of 0.1 and a duration of ${duration} to it. After ${duration}ms, the RotateTicker will be removed.`)
        },
        async () => {
            let my_speed = 0.1
            let my_speed2 = 0.3
            const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');
            const alien = CanvasSprite.from(texture);

            alien.anchor.set(0.5);

            GameWindowManager.addCanvasElement(alien1Tag, alien);
            alien.x = 100
            alien.y = 100

            GameWindowManager.addTickersSteps(alien1Tag, [
                new TickerRotate({ speed: my_speed }, 1000),
                new TickerRotate({ speed: my_speed2 }, 1000),
            ])
            setDialogue(`I have added a image with a tag ${alien1Tag} and I connected a RotateTicker with a speed of ${my_speed} and a duration of 1000ms and then I connected a RotateTicker with a speed of ${my_speed2} and a duration of 1000ms to it.`)
        },
        async () => {
            const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');
            const alien = CanvasSprite.from(texture);

            alien.anchor.set(0.5);

            GameWindowManager.addCanvasElement(alien2Tag, alien);
            alien.x = 300
            alien.y = 100

            GameWindowManager.addTickersSteps(alien2Tag, [
                new TickerRotate({ speed: 0.1, clockwise: true }, 2000),
                Pause(500),
                new TickerRotate({ speed: 0.2, clockwise: false }, 2000),
                Repeat,
            ])
            setDialogue(`I have added a image with a tag ${alien2Tag} and I connected a RotateTicker with a speed of 0.1 and a duration of 2000ms and then I connected a RotateTicker with a speed of 0.2 and a duration of 2000ms to it. After 500ms, the RotateTicker will be repeated.`)
        },
        async () => {
            const texture = await Assets.load('https://pixijs.com/assets/eggHead.png');
            const alien = CanvasSprite.from(texture);

            alien.anchor.set(0.5);

            GameWindowManager.addCanvasElement(alien4Tag, alien);
            alien.x = 700
            alien.y = 100
            let speed = 0
            let speedLimit = 0.5
            let amt = 0.001

            GameWindowManager.addTicker(alien4Tag, new TickerRotate({ speed: speed, speedProgression: { type: "linear", amt: amt, limit: speedLimit } }))
            // GameWindowManager.addTicker(alien1Tag,
            //     new TickerAlpha({
            //         alpha: 1,
            //         alphaProgression: { type: "linear", amt: -0.01, limit: 0 }
            //     })
            // )
            GameWindowManager.addTickersSteps(alien2Tag,
                [
                    new TickerFadeAlpha({
                        duration: 1,
                        type: "hide",
                    }, 3000),
                    new TickerFadeAlpha({
                        duration: 1,
                        type: "show"
                    }, 3000),
                    Repeat,
                ]
            )

            setDialogue(`I have added a image with a tag ${alien4Tag} and I connected a RotateTicker with a speed of ${speed} and a linear speed progression of ${amt} and a limit of ${speedLimit} to it.`)
        },
    ]
)