import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { GameWindowManager } from "../../managers";
import { TickerFadeAlphaProps } from "../../types/ticker/TickerFadeAlphaProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that fades the alpha of the canvas element of the canvas.
 * @example
 * ```typescript
 * let bunny = addImage("bunny1", "https://pixijs.com/assets/eggHead.png")
 * await bunny.load()
 * GameWindowManager.addCanvasElement("bunny", bunny);
 * // ...
 * const ticker = new TickerFadeAlpha({
 *     duration: 4, // 4 seconds
 *     type: "hide",
 * }),
 * GameWindowManager.addTicker("bunny", ticker)
 * ```
 */
@tickerDecorator()
export default class TickerFadeAlpha extends TickerBase<TickerFadeAlphaProps> {
    override fn(
        ticker: Ticker,
        args: TickerFadeAlphaProps,
        tags: string[],
        tickerId: string
    ): void {
        let type = args.type === undefined ? "hide" : args.type
        let duration = args.duration === undefined ? 1 : args.duration
        let speed = 1 / (duration * 60)
        let limit = args.limit === undefined ? type === "hide" ? 0 : 1 : args.limit
        let tagToRemoveAfter = args.tagToRemoveAfter || []
        if (typeof tagToRemoveAfter === "string") {
            tagToRemoveAfter = [tagToRemoveAfter]
        }
        if (type === "hide" && limit < 0) {
            limit = 0
        }
        if (type === "show" && limit > 1) {
            limit = 1
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
                    if (type === "show" && element.alpha < limit) {
                        element.alpha += speed * ticker.deltaTime
                    }
                    else if (type === "hide" && element.alpha > limit) {
                        element.alpha -= speed * ticker.deltaTime
                    }
                    else {
                        element.alpha = limit
                        GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                    }
                }
            })
    }
}
