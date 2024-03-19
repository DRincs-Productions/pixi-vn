import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { TickerProgrationType } from "../../interface/TickerProgrationType";
import { GameWindowManager } from "../../managers/WindowManager";
import TickerBase from "./TickerBase";

/**
 * A ticker that rotates the canvas element of the canvas.
 * @param args The arguments that are passed to the ticker
 * - speed: The speed of the rotation, default is 0.1
 * - clockwise: The direction of the rotation, default is true
 * - speedProgression: The progression of the speed
 * - startOnlyIfHaveTexture?: If true, the rotation only starts if the canvas element have a texture
 * @param duration The duration of the ticker
 * @param priority The priority of the ticker
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * GameWindowManager.addCanvasElement("alien", alien);
 * const ticker = new TickerRotate({
 *    speed: 0.1,
 *    clockwise: true,
 * }),
 * GameWindowManager.addTicker("alien", ticker)
 */
@tickerDecorator()
export default class TickerRotate extends TickerBase<{ speed?: number, clockwise?: boolean, speedProgression?: TickerProgrationType, startOnlyIfHaveTexture?: boolean, }> {
    /**
     * The method that will be called every frame to rotate the canvas element of the canvas.
     * @param delta The delta time
     * @param args The arguments that are passed to the ticker
     * @param tags The tags of the canvas element that are connected to this ticker
     */
    override fn(
        t: Ticker,
        args: {
            speed?: number,
            clockwise?: boolean,
            speedProgression?: TickerProgrationType,
            startOnlyIfHaveTexture?: boolean,
        },
        tags: string[]
    ): void {
        let speed = args.speed === undefined ? 0.1 : args.speed
        let clockwise = args.clockwise === undefined ? true : args.clockwise
        tags
            .filter((tag) => {
                let element = GameWindowManager.getCanvasElement(tag)
                if (args.startOnlyIfHaveTexture) {
                    if (element && element instanceof Sprite && element.texture?.label == "EMPTY") {
                        return false
                    }
                }
                return true
            })
            .forEach((tag) => {
                let element = GameWindowManager.getCanvasElement(tag)
                if (element && element instanceof Container) {
                    if (clockwise)
                        element.rotation += speed * t.deltaTime
                    else
                        element.rotation -= speed * t.deltaTime
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
    }
}
