import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { canvas } from "../../managers";
import { FadeAlphaTickerProps } from "../../types/ticker/FadeAlphaTickerProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that fades the alpha of the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let bunny = addImage("bunny1", "https://pixijs.com/assets/eggHead.png")
 * await bunny.load()
 * canvas.addCanvasElement("bunny", bunny);
 * // ...
 * const ticker = new FadeAlphaTicker({
 *     duration: 4, // 4 seconds
 *     type: "hide",
 * }),
 * canvas.addTicker("bunny", ticker)
 * ```
 */
@tickerDecorator()
export default class FadeAlphaTicker extends TickerBase<FadeAlphaTickerProps> {
    override fn(
        ticker: Ticker,
        args: FadeAlphaTickerProps,
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
                let element = canvas.getCanvasElement(tag)
                if (args.startOnlyIfHaveTexture) {
                    if (element && element instanceof Sprite && element.texture?.label == "EMPTY") {
                        return false
                    }
                }
                return true
            })
            .forEach((tag) => {
                let element = canvas.getCanvasElement(tag)
                if (element && element instanceof Container) {
                    if (type === "show" && element.alpha < limit) {
                        element.alpha += speed * ticker.deltaTime
                    }
                    else if (type === "hide" && element.alpha > limit) {
                        element.alpha -= speed * ticker.deltaTime
                    }
                    if (type === "show" && element.alpha >= limit) {
                        element.alpha = limit
                        canvas.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                    }
                    else if (type === "hide" && element.alpha <= limit) {
                        element.alpha = limit
                        canvas.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                    }
                }
            })
    }
}
