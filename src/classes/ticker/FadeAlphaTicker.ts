import { Container as PixiContainer } from "pixi.js";
import { TickerValue } from "../..";
import { tickerDecorator } from "../../decorators";
import { checkIfTextureNotIsEmpty } from "../../functions/canvas/ticker-utility";
import { canvas } from "../../managers";
import { FadeAlphaTickerProps } from "../../types/ticker/FadeAlphaTickerProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that fades the alpha of the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
 * @example
 * ```typescript
 * let bunny = addImage("bunny1", "https://pixijs.com/assets/eggHead.png")
 * await bunny.load()
 * canvas.add("bunny", bunny);
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
        ticker: TickerValue,
        args: FadeAlphaTickerProps,
        aliases: string[],
        tickerId: string
    ): void {
        const { type = "hide", duration = 1, startOnlyIfHaveTexture } = args

        let limit = this.getLimit(args)
        const speed = 1 / (duration * 60)
        if (type === "hide" && limit < 0) {
            limit = 0
        }
        if (type === "show" && limit > 1) {
            limit = 1
        }
        aliases
            .filter((alias) => {
                let element = canvas.find(alias)
                if (!element) {
                    return false
                }
                if (startOnlyIfHaveTexture) {
                    if (!checkIfTextureNotIsEmpty(element)) {
                        return false
                    }
                }
                return true
            })
            .forEach((alias) => {
                let element = canvas.find(alias)
                if (element && element instanceof PixiContainer) {
                    if (type === "show" && element.alpha < limit) {
                        element.alpha += speed * ticker.deltaTime
                    }
                    else if (type === "hide" && element.alpha > limit) {
                        element.alpha -= speed * ticker.deltaTime
                    }
                    if (type === "show" && element.alpha >= limit) {
                        this.onEndOfTicker(alias, tickerId, args)
                    }
                    else if (type === "hide" && element.alpha <= limit) {
                        this.onEndOfTicker(alias, tickerId, args)
                    }
                }
            })
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: FadeAlphaTickerProps,
    ): void {
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias)
            if (element) {
                let limit = this.getLimit(args)
                element.alpha = limit
            }
        })
        super.onEndOfTicker(alias, tickerId, args)
    }
    private getLimit(args: FadeAlphaTickerProps): number {
        const { type = "hide", limit = type === "hide" ? 0 : 1 } = args
        return limit
    }
}
