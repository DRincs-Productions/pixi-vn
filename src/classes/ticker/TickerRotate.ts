import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { GameWindowManager } from "../../managers";
import { TickerRotateProps } from "../../types/ticker/TickerRotateProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that rotates the canvas element of the canvas. For centre rotation, set the anchor of the canvas element to 0.5.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * GameWindowManager.addCanvasElement("alien", alien);
 * const ticker = new TickerRotate({
 *    speed: 0.1,
 *    clockwise: true,
 * }),
 * GameWindowManager.addTicker("alien", ticker)
 * ```
 */
@tickerDecorator()
export default class TickerRotate extends TickerBase<TickerRotateProps> {
    override fn(
        ticker: Ticker,
        args: TickerRotateProps,
        tags: string[],
        tickerId: string
    ): void {
        let speed = (args.speed === undefined ? 1 : args.speed) / 60
        let clockwise = args.clockwise === undefined ? true : args.clockwise
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
                    if (clockwise)
                        element.rotation += speed * ticker.deltaTime
                    else
                        element.rotation -= speed * ticker.deltaTime
                    if (speed < 0.00001 && !(args.speedProgression && args.speedProgression.type == "linear" && args.speedProgression.amt != 0)) {
                        GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
    }
}
