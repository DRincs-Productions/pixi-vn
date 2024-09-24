import { Assets, Rectangle, Sprite, Texture, TextureSourceLike, Ticker } from "pixi.js";
import { CanvasSprite } from "../classes";
import { TickerBase } from "../classes/ticker";
import { canvasElementDecorator, newLabel, tickerDecorator } from "../decorators";
import { ICanvasSpriteBaseMemory, ICanvasSpriteMemory } from "../interface";
import { canvas, narration } from "../managers";
import { eggHeadImage, eggHeadName, juliette } from "./TestConstant";

interface IAlienTintingMemory extends ICanvasSpriteBaseMemory {
    direction: number
    turningSpeed: number
    speed: number
}

@canvasElementDecorator("___pixi_vn_custom_canvas_element___")
class AlienTintingTest extends CanvasSprite<IAlienTintingMemory> {
    override get memory() {
        return {
            ...super.memory,
            direction: this.direction,
            turningSpeed: this.turningSpeed,
            speed: this.speed,
        }
    }
    override set memory(memory: IAlienTintingMemory) {
        super.memory = memory as ICanvasSpriteMemory
        this.direction = memory.direction
        this.turningSpeed = memory.turningSpeed
        this.speed = memory.speed
    }
    direction: number = 0
    turningSpeed: number = 0
    speed: number = 0
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = Sprite.from(source, skipCache)
        let mySprite = new AlienTintingTest()
        mySprite.texture = sprite.texture
        return mySprite
    }
}

@tickerDecorator("___pixi_vn_custom_ticker___")
export class TintingTestTicker extends TickerBase<{}> {
    constructor() {
        super({})
    }
    override fn(_t: Ticker, _args: {}, aliases: string[]): void {
        aliases.forEach((alias) => {
            // create a bounding box for the little dudes
            const dudeBoundsPadding = 100;
            const dudeBounds = new Rectangle(-dudeBoundsPadding,
                -dudeBoundsPadding,
                canvas.screen.width + dudeBoundsPadding * 2,
                canvas.screen.height + dudeBoundsPadding * 2);
            let dude = canvas.find(alias)
            if (dude && dude instanceof AlienTintingTest) {

                dude.direction += dude.turningSpeed * 0.01;
                dude.x += Math.sin(dude.direction) * dude.speed;
                dude.y += Math.cos(dude.direction) * dude.speed;
                dude.rotation = -dude.direction - Math.PI / 2;

                // wrap the dudes by testing their bounds...
                if (dude.x < dudeBounds.x) {
                    dude.x += dudeBounds.width;
                }
                else if (dude.x > dudeBounds.x + dudeBounds.width) {
                    dude.x -= dudeBounds.width;
                }

                if (dude.y < dudeBounds.y) {
                    dude.y += dudeBounds.height;
                }
                else if (dude.y > dudeBounds.y + dudeBounds.height) {
                    dude.y -= dudeBounds.height;
                }
            }
        })
    }
}

const CUSTOM_TICKER_CANVAS_ELEMENT_TEST_LABEL = "___pixi_vn_custom_ticker_canvas_element_test___"

/**
 * https://pixijs.com/examples/basic/tinting
 */
export const customTickerCanvasElementTestLabel = newLabel(CUSTOM_TICKER_CANVAS_ELEMENT_TEST_LABEL,
    [
        async () => {
            const totalDudes = 100;

            for (let i = 0; i < totalDudes; i++) {
                // create a new Sprite that uses the image name that we just generated as its source
                const texture = await Assets.load(eggHeadImage);
                const dude = AlienTintingTest.from(texture);

                // set the anchor point so the texture is centered on the sprite
                dude.anchor.set(0.5);

                // set a random scale for the dude - no point them all being the same size!
                dude.scale.set(0.8 + Math.random() * 0.3);

                // finally lets set the dude to be at a random position..
                dude.x = Math.random() * canvas.screen.width;
                dude.y = Math.random() * canvas.screen.height;

                dude.tint = Math.random() * 0xFFFFFF;

                // create some extra properties that will control movement :
                // create a random direction in radians. This is a number between 0 and PI*2 which is the equivalent of 0 - 360 degrees
                dude.direction = Math.random() * Math.PI * 2;

                // this number will be used to modify the direction of the dude over time
                dude.turningSpeed = Math.random() - 0.8;

                // create a random speed for the dude between 2 - 4
                dude.speed = 2 + Math.random() * 2;

                canvas.add("alien" + i, dude);
                canvas.addTicker("alien" + i, new TintingTestTicker());
            }
            narration.dialogue = {
                character: juliette,
                text: `This is a test of custom ticker and canvas element. In this test, we have created ${totalDudes} ${eggHeadName} with random tint, scale, position, direction, turning speed, and speed. With the custom ticker, we are moving the custom canvas element in a random direction. (This example is from the official [PixiJS website](https://pixijs.com/8.x/examples/events/interactivity).)`
            };
        },
    ]
)
