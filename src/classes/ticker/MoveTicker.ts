import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { GameWindowManager } from "../../managers";
import { MoveTickerProps } from "../../types/ticker";
import TickerBase from "./TickerBase";

/**
 * A ticker that moves the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * GameWindowManager.addCanvasElement("alien", alien);
 * const ticker = new MoveTicker({
 *    speed: 0.1,
 *    destination: { x: 100, y: 100 },
 * }),
 * ```
 */
@tickerDecorator()
export default class MoveTicker extends TickerBase<MoveTickerProps> {
    override fn(
        ticker: Ticker,
        args: MoveTickerProps,
        tags: string[],
        tickerId: string
    ): void {
        let xSpeed = 1
        let ySpeed = 1
        if (args.speed) {
            if (typeof args.speed === "number") {
                xSpeed = args.speed
                ySpeed = args.speed
            }
            else {
                xSpeed = args.speed.x
                ySpeed = args.speed.y
            }
        }
        xSpeed /= 60
        ySpeed /= 60
        let destination = args.destination
        let tagToRemoveAfter = args.tagToRemoveAfter || []
        if (typeof tagToRemoveAfter === "string") {
            tagToRemoveAfter = [tagToRemoveAfter]
        }
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
                        element.x += xDistance * xSpeed * ticker.deltaTime
                        let newDistance = destination.x - element.x
                        if (xDistance < 0 && newDistance > 0 ||
                            xDistance > 0 && newDistance < 0
                        ) {
                            element.x = destination.x
                        }
                    }
                    let yDistance = (destination.y - element.y) > 0 ? 1 : -1
                    if (yDistance != 0) {
                        element.y += yDistance * ySpeed * ticker.deltaTime
                        let newDistance = destination.y - element.y
                        if (yDistance < 0 && newDistance > 0 ||
                            yDistance > 0 && newDistance < 0
                        ) {
                            element.y = destination.y
                        }
                    }
                    if (element.x == destination.x && element.y == destination.y) {
                        GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
    }
}
