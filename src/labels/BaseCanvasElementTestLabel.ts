import { Assets, Color, FillGradient, TextStyle } from "pixi.js";
import { CanvasContainer, CanvasSprite, CanvasText } from "../classes";
import { RotateTicker } from "../classes/ticker";
import { newLabel } from "../decorators";
import { removeCanvasElement, setDialogue } from "../functions";
import { canvas } from "../managers";
import { bunnyImage, juliette } from "./TestConstant";

const BASE_CANVAS_ELEMENT_LABEL = "___pixi_vn_base_canvas_element_label___"

export const baseCanvasElementTestLabel = newLabel(BASE_CANVAS_ELEMENT_LABEL,
    [
        async () => {
            let number = 25
            setDialogue({
                character: juliette,
                text: `Here's what's going to happen: I'm going to create ${number} bunnies (CanvasSprites) and put them in a CanvasContainer.`
            })

            // Create and add a container to the stage
            const container = new CanvasContainer();

            canvas.addCanvasElement("container", container);

            // Load the bunny texture
            const texture = await Assets.load(bunnyImage);

            // Create a 5x5 grid of bunnies in the container
            for (let i = 0; i < number; i++) {
                const bunny = new CanvasSprite(texture);

                bunny.x = (i % 5) * 40;
                bunny.y = Math.floor(i / 5) * 40;
                container.addChild(bunny);
            }

            // Move the container to the center
            container.x = canvas.screen.width / 2;
            container.y = canvas.screen.height / 2;

            // Center the bunny sprites in local container coordinates
            container.pivot.x = container.width / 2;
            container.pivot.y = container.height / 2;

            canvas.addTicker("container", new RotateTicker({ speed: 1 }));
        },
        async () => {
            removeCanvasElement("container");
            setDialogue({
                character: juliette,
                text: `Here's what's going to happen: I'm going to create some CanvasText with different styles and put them on the stage.
But it will generate a warn message, because the FillGradient or FillPattern has not yet been supported by the Pixi’VN ( you can see the status of the issue here: [#76](https://github.com/DRincs-Productions/pixi-vn/issues/76)).`
            })

            const basicStyle = new TextStyle({
                fill: '#ffffff',
            });
            const basicText = new CanvasText({
                text: 'Basic text in pixi',
                style: basicStyle
            });

            basicText.x = 50;
            basicText.y = 100;

            canvas.addCanvasElement("basicText", basicText);

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
                    color: '#ff5f74',
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

            canvas.addCanvasElement("richText", richText);

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

            canvas.addCanvasElement("skewText", skewText);
        }
    ]
)
