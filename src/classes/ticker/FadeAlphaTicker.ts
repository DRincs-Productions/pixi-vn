import { Container as PixiContainer, UPDATE_PRIORITY } from "pixi.js";
import { TickerValue } from "../..";
import { tickerDecorator } from "../../decorators";
import { checkIfTextureNotIsEmpty } from "../../functions/canvas/ticker-utility";
import { updateTickerProgression } from "../../functions/ticker-utility";
import { canvas } from "../../managers";
import { FadeAlphaTickerProps } from "../../types/ticker/FadeAlphaTickerProps";
import TickerBase from "./TickerBase";

const DEFAULT_SPEED = 1

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
    constructor(args: FadeAlphaTickerProps = {}, duration?: number, priority?: UPDATE_PRIORITY) {
        super(args, duration, priority)
    }
    override fn(
        ticker: TickerValue,
        args: FadeAlphaTickerProps,
        aliases: string[],
        tickerId: string
    ): void {
        if (args.speed === undefined) {
            if (args.duration === undefined) {
                args.speed = DEFAULT_SPEED
            }
            else {
                args.speed = 600 / (args.duration * 60)
            }
        }

        const { type = "hide", startOnlyIfHaveTexture, speedProgression } = args
        const speed = this.speedConvert(args.speed)

        let limit = this.getLimit(args)

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
                    if (speed < 0.00001 && !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)) {
                        console.warn("[Pixi’VN] The speed of the FadeAlphaTicker must be greater than 0.")
                        this.onEndOfTicker(alias, tickerId, args, { editAlpha: false })
                    }
                }
            })
        if (speedProgression)
            updateTickerProgression(args, "speed", speedProgression)
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: FadeAlphaTickerProps,
        options: { editAlpha?: boolean } = { editAlpha: true }
    ): void {
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias)
            if (element) {
                if (options.editAlpha) {
                    let limit = this.getLimit(args)
                    element.alpha = limit
                }
            }
        })
        super.onEndOfTicker(alias, tickerId, args)
    }
    private getLimit(args: FadeAlphaTickerProps): number {
        const { type = "hide", limit = type === "hide" ? 0 : 1 } = args
        return limit
    }
    private speedConvert(speed: number): number {
        return speed / 600
    }
}
