import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { GameWindowManager } from "../../managers";
import { TickerMoveProps } from "../../types/ticker/TickerMoveProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that moves the canvas element of the canvas.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * GameWindowManager.addCanvasElement("alien", alien);
 * const ticker = new TickerMove({
 *    speed: 0.1,
 *    destination: { x: 100, y: 100 },
 * }),
 * ```
 */
@tickerDecorator()
export default class TickerMove extends TickerBase<TickerMoveProps> {
    override fn(
        ticker: Ticker,
        args: TickerMoveProps,
        tags: string[]
    ): void {
        let speed = args.speed === undefined ? 0.1 : args.speed
        let destination = args.destination
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
                    let xDistance = (destination.x - element.x) > 0 ? 1 : -1
                    if (xDistance != 0) {
                        element.x += xDistance * speed * ticker.deltaTime
                        let newDistance = destination.x - element.x
                        if (xDistance < 0 && newDistance > 0 ||
                            xDistance > 0 && newDistance < 0
                        ) {
                            element.x = destination.x
                        }
                    }
                    let yDistance = destination.y - element.y
                    if (yDistance != 0) {
                        element.y += yDistance * speed * ticker.deltaTime
                        let newDistance = destination.y - element.y
                        if (yDistance < 0 && newDistance > 0 ||
                            yDistance > 0 && newDistance < 0
                        ) {
                            element.y = destination.y
                        }
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
        // TODO: onEndOfTicker
    }
}
