import { Assets, Color, FillGradient, TextStyle } from "pixi.js";
import { CanvasContainer, CanvasSprite, CanvasText, clearDialogue, GameWindowManager, newLabel, removeCanvasElement, TickerRotate } from "../pixi-vn/src";

export const baseCanvasElementTestLabel = newLabel("BaseCanvasElementTestLabel",
    [
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
        async () => {
            removeCanvasElement("container");

            const basicText = new CanvasText({ text: 'Basic text in pixi' });

            basicText.x = 50;
            basicText.y = 100;

            GameWindowManager.addCanvasElement("basicText", basicText);

            // Create gradient fill
            const fill = new FillGradient(0, 0, 0, 36 * 1.7 * 7);

            const colors = [0xffffff, 0x00ff99].map((color) => Color.shared.setValue(color).toNumber());

            colors.forEach((number, index) => {
                const ratio = index / colors.length;

                fill.addColorStop(ratio, number);
            });

            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: { fill },
                stroke: { color: '#4a1850', width: 5, join: 'round' },
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    angle: Math.PI / 6,
                    distance: 6,
                },
                wordWrap: true,
                wordWrapWidth: 440,
            });

            const richText = new CanvasText({
                text: 'Rich text with a lot of options and across multiple lines',
                style,
            });

            richText.x = 50;
            richText.y = 220;

            GameWindowManager.addCanvasElement("richText", richText);

            const skewStyle = new TextStyle({
                fontFamily: 'Arial',
                dropShadow: {
                    alpha: 0.8,
                    angle: 2.1,
                    blur: 4,
                    color: '0x111111',
                    distance: 10,
                },
                fill: '#ffffff',
                stroke: { color: '#004620', width: 12, join: 'round' },
                fontSize: 60,
                fontWeight: 'lighter',
            });

            const skewText = new CanvasText({
                text: 'SKEW IS COOL',
                style: skewStyle,
            });

            skewText.skew.set(0.65, -0.3);
            skewText.anchor.set(0.5, 0.5);
            skewText.x = 300;
            skewText.y = 480;

            GameWindowManager.addCanvasElement("skewText", skewText);
        }
    ]
)
