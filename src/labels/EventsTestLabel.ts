import { Assets, Texture } from "pixi.js";
import { CanvasEvent, CanvasEventNamesType, CanvasSprite, clearDialogue, eventDecorator, GameWindowManager, newLabel, setDialogue } from "../pixi-vn/src";

@eventDecorator()
export class EventTest extends CanvasEvent<CanvasSprite> {
    override fn(event: CanvasEventNamesType, sprite: CanvasSprite): void {
        if (event === 'pointerdown') {
            sprite.scale.x *= 1.25;
            sprite.scale.y *= 1.25;
        }
    }
}
@eventDecorator()
export class EventTest2 extends CanvasEvent<CanvasSprite> {
    textureButtonDown = Texture.from('https://pixijs.com/assets/button_down.png');
    textureButtonOver = Texture.from('https://pixijs.com/assets/button_over.png');
    textureButton = Texture.from('https://pixijs.com/assets/button.png');
    override fn(event: CanvasEventNamesType, sprite: CanvasSprite): void {
        if (event === 'pointerdown') {
            (sprite as any).isdown = true;
            sprite.texture = this.textureButtonDown;
            sprite.alpha = 1;
        }
        else if (event === 'pointerup' || event === 'pointerupoutside') {
            (sprite as any).isdown = false;
            if ((sprite as any).isOver) {
                sprite.texture = this.textureButtonOver;
            }
            else {
                sprite.texture = this.textureButton;
            }
        }
        else if (event === 'pointerover') {
            (sprite as any).isOver = true;
            if ((sprite as any).isdown) {
                return;
            }
            sprite.texture = this.textureButtonOver;
        }
        else if (event === 'pointerout') {
            (sprite as any).isOver = false;
            if ((sprite as any).isdown) {
                return;
            }
            sprite.texture = this.textureButton;
        }
    }
}

/**
 * https://pixijs.com/examples/basic/tinting
 */
export const eventsTestLabel = newLabel("EventsTestLabel",
    [
        async () => {
            // Load the bunny texture
            const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

            // Create the bunny sprite
            const sprite = CanvasSprite.from(texture);

            // Set the initial position
            sprite.anchor.set(0.5);
            sprite.x = GameWindowManager.screen.width / 2;
            sprite.y = GameWindowManager.screen.height / 2;

            // Opt-in to interactivity
            sprite.eventMode = 'static';

            // Shows hand cursor
            sprite.cursor = 'pointer';

            // Pointers normalize touch and mouse (good for mobile and desktop)
            sprite.onEvent('pointerdown', EventTest);

            // Alternatively, use the mouse & touch events:
            // sprite.on('click', onClick); // mouse-only
            // sprite.on('tap', onClick); // touch-only

            GameWindowManager.addCanvasElement("bunny", sprite);

            setDialogue("This is the test of clickable elements in a canvas. To make it possible to save the added events in a canvas element, use CanvasEvents.");
        },
        () => setDialogue("To make the events in the canvas work. by default all elements in the gliaphic html interface are: pointerEvents = 'none'. to enable clicking on html elements, you will need to add the css pointerEvents = 'auto'"),
        () => setDialogue("For performance reasons it is better to add the buttons in the html interface and not in the canvas."),
        async () => {
            clearDialogue();
            GameWindowManager.clear();

            // Load textures
            await Assets.load([
                'https://pixijs.com/assets/bg_button.jpg',
                'https://pixijs.com/assets/button.png',
                'https://pixijs.com/assets/button_down.png',
                'https://pixijs.com/assets/button_over.png',
            ]);

            // Create a background...
            const background = CanvasSprite.from('https://pixijs.com/assets/bg_button.jpg');

            background.width = GameWindowManager.screen.width;
            background.height = GameWindowManager.screen.height;

            // Add background to stage...
            GameWindowManager.addCanvasElement("bg", background);

            // Create some textures from an image path
            const textureButton = Texture.from('https://pixijs.com/assets/button.png');

            const buttons = [];

            const buttonPositions = [175, 75, 655, 75, 410, 325, 150, 465, 685, 445];

            for (let i = 0; i < 5; i++) {
                const button = new CanvasSprite(textureButton);

                button.anchor.set(0.5);
                button.x = buttonPositions[i * 2];
                button.y = buttonPositions[i * 2 + 1];

                // Make the button interactive...
                button.eventMode = 'static';
                button.cursor = 'pointer';

                button
                    // Mouse & touch events are normalized into
                    // the pointer* events for handling different
                    // button events.
                    .onEvent('pointerdown', EventTest2)
                    .onEvent('pointerup', EventTest2)
                    .onEvent('pointerupoutside', EventTest2)
                    .onEvent('pointerover', EventTest2)
                    .onEvent('pointerout', EventTest2);

                // Add it to the stage
                GameWindowManager.addCanvasElement("button" + i, button);

                // Add button to array
                buttons.push(button);
            }

            // Set some silly values...
            buttons[0].scale.set(1.2);
            buttons[2].rotation = Math.PI / 10;
            buttons[3].scale.set(0.8);
            buttons[4].scale.set(0.8, 1.2);
            buttons[4].rotation = Math.PI;
        }
    ]
)
